#!/usr/bin/env node
/**
 * Production start wrapper (Hostinger and any host that runs `npm start`).
 *
 * ORDER MATTERS — this file is the reason the site can or cannot be down.
 *
 * The marketing front end is prerendered static HTML: `/`, `/about`,
 * `/services`, `/portfolio`, `/products`, `/suites`, `/methodology`, `/audit`
 * are all built at compile time and need NO database to serve. So they must
 * never wait on one. We therefore:
 *
 *   1. Load .grow.env — synchronous file reads only, cannot hang.
 *   2. Start Next.js IMMEDIATELY. Nothing fallible is allowed to run before
 *      this line, because until it runs the whole site is offline.
 *   3. Sync schema / migrate / seed in the BACKGROUND, after the server is
 *      already accepting traffic — every step time-boxed and non-fatal.
 *
 * An earlier version did step 3 *before* step 2 using blocking spawnSync
 * calls. An unreachable or slow database meant the web server never started
 * listening, the host's boot probe gave up, and the entire site — including
 * pages that need no database at all — served 503. Database problems must
 * only ever degrade the admin modules, never the front end.
 *
 * Binaries are resolved from node_modules/.bin rather than invoked through
 * `npx`: npx falls back to fetching from the registry when resolution fails,
 * which on a shared host turns a missing package into a boot-time hang.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// Nothing below may take the supervisor process down. Next.js runs as a child,
// so anything thrown up here comes from bootstrap code — log it and carry on.
process.on("unhandledRejection", (err) => console.error("[bootstrap] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[bootstrap] uncaught exception:", err));

// ─────────────────────────────────────────────────────────────────────────
// 1. Secrets
// ─────────────────────────────────────────────────────────────────────────
// Production secrets live OUTSIDE the deploy directory so git redeploys keep
// them. Create ONE file named `.grow.env` (DATABASE_URL, AUTH_SECRET,
// ADMIN_EMAIL/ADMIN_PASSWORD, STAFF_PASSWORD) anywhere above the app — e.g.
// the domain folder hPanel's File Manager opens into (the one holding
// public_html). We search every ancestor directory plus the account home.
// Values here never override variables already set in the environment.
function findPersistentEnv() {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, ".grow.env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const home = join(homedir(), ".grow.env");
  return existsSync(home) ? home : null;
}

try {
  const persistentEnv = findPersistentEnv();
  if (persistentEnv) {
    loadEnv({ path: persistentEnv });
    console.log(`[start] Loaded persistent secrets from ${persistentEnv}`);
  } else {
    console.warn("[start] No .grow.env found — starting without it (front end still serves).");
  }
} catch (err) {
  console.warn("[start] Could not read .grow.env:", err.message);
}

/** Find a CLI in the nearest node_modules/.bin, walking up to the repo root. */
function resolveBin(name) {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const candidate = join(dir, "node_modules", ".bin", name);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Web server — first, and unconditional
// ─────────────────────────────────────────────────────────────────────────
const nextBin = resolveBin("next");
if (!nextBin) {
  console.error("[start] FATAL: next binary not found in any node_modules/.bin.");
  console.error("[start] Run `npm install` on the server — the site cannot serve without it.");
  process.exit(1);
}

console.log("[start] Starting Next.js…");
const server = spawn(nextBin, ["start"], { stdio: "inherit" });

server.on("error", (err) => {
  console.error("[start] FATAL: could not start Next.js:", err.message);
  process.exit(1);
});
server.on("exit", (code, signal) => {
  console.error(`[start] Next.js exited (code=${code} signal=${signal}).`);
  process.exit(code ?? 1);
});
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => server.kill(sig));
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Database bootstrap — background, time-boxed, never fatal
// ─────────────────────────────────────────────────────────────────────────
/** Run one bootstrap step. Resolves false on failure/timeout; never throws. */
function step(label, cmd, args, timeoutMs = 120_000) {
  return new Promise((resolve) => {
    console.log(`[bootstrap] ${label}…`);
    let child;
    try {
      child = spawn(cmd, args, { stdio: "inherit", timeout: timeoutMs, killSignal: "SIGKILL" });
    } catch (err) {
      console.warn(`[bootstrap] ${label} could not start: ${err.message}`);
      return resolve(false);
    }
    child.on("error", (err) => {
      console.warn(`[bootstrap] ${label} could not run: ${err.message}`);
      resolve(false);
    });
    child.on("exit", (code, signal) => {
      if (signal) console.warn(`[bootstrap] ${label} timed out after ${timeoutMs / 1000}s — skipped.`);
      else if (code !== 0) console.warn(`[bootstrap] ${label} exited ${code} — continuing.`);
      else console.log(`[bootstrap] ${label} ok.`);
      resolve(code === 0);
    });
  });
}

async function bootstrapDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("[bootstrap] DATABASE_URL is not set — skipping. Front end unaffected;");
    console.warn("[bootstrap] admin/engine/producer modules need it. Add it to .grow.env.");
    return;
  }

  const prismaBin = resolveBin("prisma");
  if (prismaBin) {
    // Additive and non-destructive: creates new tables/columns and refuses
    // anything that would drop data.
    await step("schema sync (prisma db push)", prismaBin, ["db", "push", "--skip-generate"]);
  } else {
    console.warn("[bootstrap] prisma CLI not found — skipping schema sync.");
  }

  // The Grow Engine's MySQL schema is Drizzle-managed, so `prisma db push`
  // does not cover it. Idempotent.
  await step("engine schema", process.execPath, ["scripts/migrate-engine.mjs"]);

  // The founding team's IAM super-admin accounts (idempotent).
  await step("staff IAM accounts", process.execPath, ["scripts/seed-staff.mjs"]);

  // Seed once, only when the catalog is actually empty.
  try {
    const require = createRequire(import.meta.url);
    const { PrismaClient } = require("../src/generated/prisma");
    const prisma = new PrismaClient();
    const suites = await prisma.suite.count().catch(() => -1);
    const vacancies = await prisma.vacancy.count().catch(() => -1);
    await prisma.$disconnect().catch(() => {});

    if (suites === 0) {
      console.log("[bootstrap] Empty database — seeding catalog + demo data…");
      if (prismaBin) await step("catalog seed", prismaBin, ["db", "seed"]);
      await step("demo seed", process.execPath, ["scripts/demo-seed.mjs"]);
      await step("producer seed", process.execPath, ["scripts/seed-producer.mjs"]);
    } else if (suites > 0) {
      console.log(`[bootstrap] Database already has ${suites} suites — skipping seed.`);
      if (vacancies === 0) {
        await step("producer seed", process.execPath, ["scripts/seed-producer.mjs"]);
      }
    }
  } catch (err) {
    console.warn("[bootstrap] Seed step skipped:", err.message);
  }
}

// Give Next a few seconds of uncontended CPU to bind its port before the
// bootstrap work starts competing for it on a shared host.
setTimeout(() => {
  bootstrapDatabase()
    .then(() => console.log("[bootstrap] Done."))
    .catch((err) => console.warn("[bootstrap] Failed (site unaffected):", err.message));
}, 5_000);
