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
//
// Two copies can exist — the domain folder's (nearest ancestor) and the
// account home's — and until 2026-09-12 only the nearest one was read. The
// SMTP block was added to ~/.grow.env while the app read the domain-level
// file, so mail stayed unconfigured and the only clue was a public health flag.
// Now: the nearest file is AUTHORITATIVE (override: true, as before); any
// other copy is read afterwards and fills only keys the primary lacks, and
// /api/health names which keys came from it. Edit the domain-level file for
// anything that must win; the home file can no longer be silently ignored.
function findPersistentEnvFiles() {
  const found = [];
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, ".grow.env");
    if (fs.existsSync(candidate)) {
      found.push(candidate);
      break; // nearest wins; deeper copies would be an accident, not a layer
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const home = path.join(require("node:os").homedir(), ".grow.env");
  if (fs.existsSync(home) && !found.includes(home)) found.push(home);
  return found;
}

// "domain" / "home" / "other" for /api/health — never the path, which carries
// the hosting username and that endpoint is public.
function describeEnvFile(file) {
  if (file.includes(`${path.sep}domains${path.sep}`)) return "domain";
  if (file === path.join(require("node:os").homedir(), ".grow.env")) return "home";
  return "other";
}

let resolvedEnvPath = null;
try {
  const dotenv = require(require.resolve("dotenv", { paths: [APP_DIR, __dirname] }));
  const [primary, ...secondaries] = findPersistentEnvFiles();
  if (primary) {
    resolvedEnvPath = primary;
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
    dotenv.config({ path: primary, override: true });
    console.log(`[server] Loaded persistent secrets from ${primary} (authoritative)`);
    process.env.GROW_ENV_SOURCE = describeEnvFile(primary);

    for (const file of secondaries) {
      const filled = [];
      for (const [key, value] of Object.entries(dotenv.parse(fs.readFileSync(file)))) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
          filled.push(key);
        }
      }
      process.env.GROW_ENV_SECONDARY = describeEnvFile(file);
      process.env.GROW_ENV_SECONDARY_KEYS = filled.join(",");
      console.log(
        `[server] Also read ${file} (secondary): filled ${filled.length} key(s) the primary lacks` +
          (filled.length ? `: ${filled.join(", ")}` : "")
      );
    }
  } else {
    console.warn("[server] No .grow.env found — starting without it (front end still serves).");
  }
} catch (err) {
  console.warn("[server] Could not read .grow.env:", err.message);
}

// ── 1a. DATABASE_URL host selection ────────────────────────────────────────
// Pick the database host that actually WORKS, by connecting to each candidate
// before Next starts. Not by assumption — by proof.
//
// History, because it matters for why this is a probe and not a constant:
//
//  - MySQL accounts are per-host: `user@localhost` and `user@<ip>` are different
//    accounts with different passwords. The `@localhost` account once carried a
//    stale password, so this file unconditionally rewrote localhost →
//    srv1808.hstgr.io.
//  - That rewrite turned a loopback connection into a network round-trip, which
//    then depended on an external route AND on a per-IP remote-access grant.
//    On 2026-09-01 that path broke: the node could not open TCP to
//    srv1808.hstgr.io at all (Prisma P1001), so every login failed with "Cannot
//    reach the accounts database" while the database itself was perfectly
//    healthy and reachable from elsewhere.
//
// A local connection has neither dependency: no external route, no grant list,
// nothing to revoke by accident. So localhost is tried FIRST and the remote host
// is only a fallback. The probe is boot-time and one-shot — it makes a decision
// and gets out of the way, rather than wrapping queries at runtime (an earlier
// attempt at runtime recovery caused a far worse outage).
async function selectDatabaseHost() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return;

  let base;
  try {
    base = new URL(raw);
  } catch {
    console.log("[server] DATABASE_URL is not a parseable URL — leaving it untouched.");
    return;
  }

  const remoteHost = process.env.DATABASE_HOST || "srv1808.hstgr.io";
  // Candidates in order of preference. localhost first: it cannot be broken by a
  // routing change or a revoked grant.
  const candidates = [];
  const seen = new Set();
  for (const host of ["localhost", "127.0.0.1", remoteHost]) {
    if (!host || seen.has(host)) continue;
    seen.add(host);
    const u = new URL(base.toString());
    u.hostname = host;
    candidates.push({ host, url: u.toString() });
  }

  let mysql;
  try {
    mysql = require(require.resolve("mysql2/promise", { paths: [APP_DIR, __dirname] }));
  } catch (err) {
    // Without mysql2 we cannot probe. Leave DATABASE_URL exactly as configured
    // rather than guessing — /api/health/db will report the truth either way.
    console.log(`[server] cannot probe database hosts (${err.message}); using DATABASE_URL as configured.`);
    return;
  }

  for (const { host, url } of candidates) {
    let conn;
    try {
      conn = await mysql.createConnection({ uri: url, connectTimeout: 4000 });
      await conn.query("SELECT 1");
      process.env.DATABASE_URL = url;
      console.log(`[server] database host: ${host} (probed OK)`);
      return;
    } catch (err) {
      console.log(`[server] database host ${host} unusable: ${err.code || err.message}`);
    } finally {
      if (conn) { try { await conn.end(); } catch {} }
    }
  }

  console.log(
    "[server] NO database host reachable. Leaving DATABASE_URL as configured; " +
      "the front end still serves and /api/health/db reports the cause."
  );
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

// Probe BEFORE preparing Next, not alongside it.
//
// PrismaClient reads DATABASE_URL when it is CONSTRUCTED, and lib/db.ts
// constructs it at module scope — so the moment Next imports any route that
// touches the database, the URL is captured. Racing the probe against
// app.prepare() would sometimes lose, and the resulting misconfiguration would
// look exactly like the outage this is meant to prevent.
//
// The cost is a few seconds at boot, and only when localhost is unusable —
// a working local connection probes in milliseconds.
//
// selectDatabaseHost never rejects: it logs and returns, so it cannot stop the
// server coming up. A database that is entirely unreachable still leaves the
// marketing pages serving from their bundled fallback.
selectDatabaseHost()
  .then(() => app.prepare())
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
