/**
 * Passenger entry point — THE file the host actually boots.
 *
 * growcdx.com's document-root .htaccess pins:
 *   PassengerAppRoot    /home/u454713534/domains/growcdx.com/nodejs
 *   PassengerStartupFile server.js
 *
 * This repo never contained a server.js, so Passenger kept executing a
 * leftover server.js from an old deployment. That is why deploys "succeeded"
 * for months while the live site never changed: the build ran, its output was
 * published, and the process that serves traffic was still the old app. It is
 * why a removed section stayed on /about and why /portfolio 404'd.
 *
 * Owning this file makes every deploy authoritative.
 *
 * Serving is in-process (Passenger owns the listening socket), so unlike
 * scripts/start.mjs we must NOT spawn `next start` — we hand requests to
 * Next's request handler directly. The ordering rule from that script still
 * applies and matters more here: start listening first, and only then do
 * fallible database work in the background. The marketing pages are
 * prerendered and need no database; they must never wait on one.
 */
"use strict";

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");

const APP_DIR = path.join(__dirname, "apps", "grow");
const PORT = process.env.PORT || 3000;

// Passenger restarts the app on an uncaught error. Bootstrap problems must
// degrade the admin modules, never take the front end down.
process.on("unhandledRejection", (err) => console.error("[server] unhandled rejection:", err));
process.on("uncaughtException", (err) => console.error("[server] uncaught exception:", err));

// ── 1. Secrets ────────────────────────────────────────────────────────────
// Production secrets live OUTSIDE the deploy directory so redeploys keep them.
// Same contract as scripts/start.mjs: a .grow.env anywhere above the app.
function findPersistentEnv() {
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, ".grow.env");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const home = path.join(require("node:os").homedir(), ".grow.env");
  return fs.existsSync(home) ? home : null;
}

try {
  const envPath = findPersistentEnv();
  if (envPath) {
    require(require.resolve("dotenv", { paths: [APP_DIR, __dirname] })).config({ path: envPath });
    console.log(`[server] Loaded persistent secrets from ${envPath}`);
  } else {
    console.warn("[server] No .grow.env found — starting without it (front end still serves).");
  }
} catch (err) {
  console.warn("[server] Could not read .grow.env:", err.message);
}

// ── 2. Web server — first, and unconditional ──────────────────────────────
// `next` is a dependency of apps/grow; resolve it from there so this works
// whether or not the install hoisted it to the repo root.
const next = require(require.resolve("next", { paths: [APP_DIR, __dirname] }));

const app = next({ dev: false, dir: APP_DIR });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => handle(req, res))
      .listen(PORT, () => {
        console.log(`[server] Next.js listening on ${PORT} (dir: ${APP_DIR})`);
        setTimeout(bootstrapDatabase, 5_000);
      });
  })
  .catch((err) => {
    console.error("[server] FATAL: Next failed to start:", err);
    process.exit(1);
  });

// ── 3. Database bootstrap — background, time-boxed, never fatal ───────────
function step(label, cmd, args, timeoutMs = 120_000) {
  return new Promise((resolve) => {
    console.log(`[bootstrap] ${label}…`);
    let child;
    try {
      child = spawn(cmd, args, { cwd: APP_DIR, stdio: "inherit", timeout: timeoutMs, killSignal: "SIGKILL" });
    } catch (err) {
      console.warn(`[bootstrap] ${label} could not start: ${err.message}`);
      return resolve(false);
    }
    child.on("error", (err) => {
      console.warn(`[bootstrap] ${label} could not run: ${err.message}`);
      resolve(false);
    });
    child.on("exit", (code, signal) => {
      if (signal) console.warn(`[bootstrap] ${label} timed out — skipped.`);
      else if (code !== 0) console.warn(`[bootstrap] ${label} exited ${code} — continuing.`);
      else console.log(`[bootstrap] ${label} ok.`);
      resolve(code === 0);
    });
  });
}

function resolveBin(name) {
  for (const base of [APP_DIR, __dirname]) {
    const candidate = path.join(base, "node_modules", ".bin", name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function bootstrapDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("[bootstrap] DATABASE_URL is not set — skipping. Front end unaffected;");
    console.warn("[bootstrap] admin/engine/producer modules need it. Add it to .grow.env.");
    return;
  }
  try {
    const prismaBin = resolveBin("prisma");
    if (prismaBin) await step("schema sync (prisma db push)", prismaBin, ["db", "push", "--skip-generate"]);
    else console.warn("[bootstrap] prisma CLI not found — skipping schema sync.");

    await step("engine schema", process.execPath, ["scripts/migrate-engine.mjs"]);
    await step("staff IAM accounts", process.execPath, ["scripts/seed-staff.mjs"]);
    console.log("[bootstrap] Done.");
  } catch (err) {
    console.warn("[bootstrap] Failed (site unaffected):", err.message);
  }
}
