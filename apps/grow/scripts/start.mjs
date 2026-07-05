#!/usr/bin/env node
/**
 * Production start wrapper (Hostinger and any host that runs `npm start`).
 *
 * On boot we, in order:
 *   1. Load .env (so DATABASE_URL etc. are available to this pre-Next step).
 *   2. `prisma db push` — additive, non-destructive: creates new tables/columns
 *      (hub + producer modules) and refuses anything that would drop data.
 *   3. Seed catalog + demo data ONCE, only when the database is empty, so a
 *      fresh deploy comes up populated. Idempotent across redeploys.
 *   4. Start Next.js (respects the host-assigned PORT).
 *
 * Any DB hiccup is logged and the app still starts, so a transient issue never
 * takes the whole site down.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

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
const persistentEnv = findPersistentEnv();
if (persistentEnv) {
  loadEnv({ path: persistentEnv });
  console.log(`[start] Loaded persistent secrets from ${persistentEnv}`);
} else {
  console.warn("[start] No .grow.env found in any parent directory or home.");
}

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
}

if (process.env.DATABASE_URL) {
  console.log("[start] Syncing database schema (prisma db push)…");
  const push = run("npx", ["prisma", "db", "push", "--skip-generate"]);
  if (push.status !== 0) {
    console.warn("[start] Schema sync did not complete cleanly. Starting anyway.");
  }

  // Ensure the Grow Engine's MySQL schema (Drizzle-managed, not covered by
  // prisma db push). Idempotent + failure-tolerant.
  console.log("[start] Ensuring Grow Engine schema…");
  run("node", ["scripts/migrate-engine.mjs"]);

  // Ensure the founding team's IAM super-admin accounts exist (idempotent).
  console.log("[start] Ensuring staff IAM accounts…");
  run("node", ["scripts/seed-staff.mjs"]);

  // Seed once, only if the catalog is empty.
  try {
    const require = createRequire(import.meta.url);
    const { PrismaClient } = require("../src/generated/prisma");
    const prisma = new PrismaClient();
    const suites = await prisma.suite.count().catch(() => -1);
    const vacancies = await prisma.vacancy.count().catch(() => -1);
    await prisma.$disconnect();
    if (suites === 0) {
      console.log("[start] Empty database — seeding catalog + demo data…");
      run("npx", ["prisma", "db", "seed"]);        // suites/products + launch project
      run("node", ["scripts/demo-seed.mjs"]);      // CRM leads, invoices, tickets, tenant
      run("node", ["scripts/seed-producer.mjs"]);  // recruiter demo (vacancies/candidates)
    } else if (suites > 0) {
      console.log(`[start] Database already has ${suites} suites — skipping seed.`);
      if (vacancies === 0) {
        console.log("[start] Producer module empty — seeding recruiter demo…");
        run("node", ["scripts/seed-producer.mjs"]);
      }
    }
  } catch (e) {
    console.warn("[start] Seed step skipped:", e.message);
  }
} else {
  console.warn("[start] DATABASE_URL is not set — skipping schema sync.");
}

const next = run("npx", ["next", "start"]);
process.exit(next.status ?? 0);
