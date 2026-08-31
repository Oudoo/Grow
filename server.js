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

// Run FROM the Next app directory, the way `next start` would.
//
// Passenger sets cwd to PassengerAppRoot (<domain>/nodejs), but the app itself
// lives at <root>/apps/grow because we deploy the monorepo. Prisma resolves its
// query-engine binary relative to cwd, so it looked for
//   <nodejs>/src/generated/prisma/libquery_engine-debian-openssl-1.1.x.so.node
// and failed with PrismaClientInitializationError ("could not locate the Query
// Engine"), while the real file sits under apps/grow/src/generated/prisma.
// Every database call then threw — which surfaced only as a failed login,
// because the marketing pages fall back to bundled data on a DB error.
// This used to work by accident: the previous app root was a FLAT copy of
// apps/grow, so cwd-relative lookups happened to land correctly.
try {
  if (fs.existsSync(APP_DIR)) process.chdir(APP_DIR);
} catch (err) {
  console.error("[server] could not chdir to the app directory:", err.message);
}

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

let resolvedEnvPath = null;
try {
  resolvedEnvPath = findPersistentEnv();
  if (resolvedEnvPath) {
    // override: true — .grow.env is the AUTHORITATIVE production secret store.
    //
    // The host also injects environment variables from its control panel, and
    // those are set before this process starts, so plain dotenv (which never
    // replaces an existing value) silently loses to them. That is how a stale
    // panel-configured DATABASE_URL kept its old password and made every query
    // fail with "Authentication failed against database server" — while the
    // correct value sat in this file, ignored.
    //
    // This file lives outside the deploy directory, survives redeploys, is not
    // in git, and is the documented place for production secrets. It should win.
    require(require.resolve("dotenv", { paths: [APP_DIR, __dirname] })).config({
      path: resolvedEnvPath,
      override: true,
    });
    console.log(`[server] Loaded persistent secrets from ${resolvedEnvPath} (authoritative)`);
  } else {
    console.warn("[server] No .grow.env found — starting without it (front end still serves).");
  }
} catch (err) {
  console.warn("[server] Could not read .grow.env:", err.message);
}

// ── 1a. DATABASE_URL host normalisation ────────────────────────────────────
// MySQL accounts are per-host: `user@localhost` and `user@<ip>` are DIFFERENT
// accounts with DIFFERENT passwords. On this host the `@localhost` account still
// carries an old password that cannot be changed from the panel or over SQL
// (ALTER USER is not permitted to this user), so connecting via `localhost`
// fails with "Authentication failed against database server" even though the
// credentials are correct for the account we CAN manage.
//
// Point at the real database hostname instead, whose account matches the
// panel-set password. Override with DATABASE_HOST if the host ever changes.
try {
  const raw = process.env.DATABASE_URL;
  if (raw) {
    const u = new URL(raw);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      u.hostname = process.env.DATABASE_HOST || "srv1808.hstgr.io";
      process.env.DATABASE_URL = u.toString();
      console.log(`[server] DATABASE_URL host normalised to ${u.hostname} (per-host MySQL accounts)`);
    }
  }
} catch (err) {
  console.warn("[server] could not normalise DATABASE_URL host:", err.message);
}

// ── 1b. AUTH_SECRET must exist, and must not be a shared/guessable default ──
// Sessions are signed with AUTH_SECRET. src/lib/auth.ts deliberately refuses to
// fall back to a hardcoded key in production (a known key = forgeable sessions),
// which means a missing AUTH_SECRET makes every login throw. Rather than fail the
// whole console, generate a strong secret once and persist it to .grow.env — that
// file lives OUTSIDE the deploy directory, so it survives redeploys and never
// enters git. Existing sessions are invalidated once, on the boot that creates it.
try {
  const current = process.env.AUTH_SECRET;
  if (!current || current.length < 16) {
    const generated = require("node:crypto").randomBytes(32).toString("base64");
    process.env.AUTH_SECRET = generated;

    const target = resolvedEnvPath || path.join(path.dirname(__dirname), ".grow.env");
    try {
      const line = `\n# Generated automatically on first boot — do not share or commit.\nAUTH_SECRET=${generated}\n`;
      fs.appendFileSync(target, line, { mode: 0o600 });
      console.warn(
        `[server] AUTH_SECRET was missing/too short — generated a new one and saved it to ${target}. ` +
          `Existing sessions are invalidated; everyone signs in again once.`
      );
    } catch (writeErr) {
      // Could not persist (read-only FS/permissions): keep the in-memory secret so
      // logins work now, but warn loudly — it will differ on the next boot.
      console.error(
        `[server] AUTH_SECRET missing and could not be persisted to ${target}: ${writeErr.message}. ` +
          `Using an in-memory secret — sessions will not survive a restart. Set AUTH_SECRET manually.`
      );
    }
  }
} catch (err) {
  console.error("[server] AUTH_SECRET bootstrap failed:", err.message);
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
    // Outcomes go to STDOUT, deliberately — including the failures.
    //
    // These used to be console.warn, which lands in nodejs/stderr.log. That
    // file grew large enough to be unreadable (ERR_STRING_TOO_LONG), so three
    // consecutive deploys logged "schema sync (prisma db push)…" and then
    // silently moved on with no visible outcome, while the schema never
    // applied. A bootstrap step's result is exactly the thing you need to read
    // after a deploy; it belongs in the log you can actually open.
    child.on("error", (err) => {
      console.log(`[bootstrap] ${label} could not run: ${err.message}`);
      resolve(false);
    });
    child.on("exit", (code, signal) => {
      if (signal) console.log(`[bootstrap] ${label} timed out — skipped.`);
      else if (code !== 0) console.log(`[bootstrap] ${label} exited ${code} — continuing.`);
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
    // Hub schema first, over mysql2 — see scripts/migrate-hub.mjs for why this
    // does not use `prisma db push`. The CLI needs Prisma's schema-engine
    // binary, which is not usable on this host: the push step failed on every
    // boot while the app's own queries worked fine.
    await step("hub schema", process.execPath, ["scripts/migrate-hub.mjs"]);

    // Still attempt the CLI push afterwards. It is a no-op when migrate-hub has
    // already applied everything, and if the CLI ever becomes usable here it
    // catches anything the hand-written DDL missed. Its failure is now logged
    // visibly rather than swallowed into an unreadable stderr.log.
    const prismaBin = resolveBin("prisma");
    if (prismaBin) await step("schema sync (prisma db push)", prismaBin, ["db", "push", "--skip-generate"]);
    else console.log("[bootstrap] prisma CLI not found — skipping schema sync.");

    await step("engine schema", process.execPath, ["scripts/migrate-engine.mjs"]);
    await step("staff IAM accounts", process.execPath, ["scripts/seed-staff.mjs"]);

    // AFTER the staff seed — it can only match owners against accounts that
    // already exist. Idempotent: a no-op once every task is linked.
    await step("link task owners", process.execPath, ["scripts/link-task-owners.mjs"]);

    // Client knowledge bases: content/clients/**.md is the source of truth, and
    // this pushes it into the engine so an edited dossier ships with a deploy.
    // Idempotent — no writes when nothing changed.
    await step("client knowledge bases", process.execPath, ["scripts/seed-client-knowledge.mjs"]);

    // Default system configuration. Writes only when nothing is configured yet,
    // so an admin's own edits in the Configuration screen are never clobbered.
    await step("system configuration", process.execPath, ["scripts/seed-config.mjs"]);

    console.log("[bootstrap] Done.");
  } catch (err) {
    console.warn("[bootstrap] Failed (site unaffected):", err.message);
  }
}
