#!/usr/bin/env node
/**
 * Engine schema bootstrap — the Drizzle migrations in ./drizzle-engine,
 * applied statement by statement over mysql2. Runs on every boot from
 * server.js (after the web server is listening) and by hand from a laptop:
 *
 *   DATABASE_URL="mysql://…" node scripts/migrate-engine.mjs
 *
 * WHY NOT drizzle-orm's migrate() ANY MORE
 * ---------------------------------------
 * It wraps every pending migration in one transaction and records a migration
 * only once all of its statements succeed. MySQL DDL commits implicitly, so
 * one failing statement leaves the schema partially applied and NOTHING
 * recorded; every later boot re-runs `CREATE TABLE …`, hits "already exists",
 * and stops. The previous version of this script then swallowed that error
 * ("failure-tolerant"), so the log showed nothing at all.
 *
 * That is how production ran for weeks with migration 0000 in place but
 * unrecorded, migration 0001 — which adds queue_jobs.available_at and the
 * other polling columns — never applied, and five in-process workers failing
 * the same SELECT ~7 times a second into a 6.7 GB stderr.log. Same bug class
 * as the invisible `prisma db push` failure in migrate-hub.mjs: a boot step
 * whose failure nobody can see. Diagnosed 2026-09-12 by reading the schema
 * directly; confirmed by `/api/health/db`, which now reports `queueJobs` and
 * `engineMigrations` for exactly this reason.
 *
 * RULES
 *  - "Already exists" (table, column, index, constraint) is an outcome, not
 *    an error. The object is there; move on and record the migration.
 *  - Any OTHER error stops the run, prints the migration, statement number and
 *    MySQL code to STDOUT (the log that can actually be read here), and exits
 *    non-zero so server.js's step() shows "exited 1" instead of "ok".
 *  - Bookkeeping stays byte-compatible with drizzle-orm (same table, same
 *    sha256 hash, same created_at rule) — scripts/lib/engine-migrations.mjs.
 *  - Additive only. New migrations come from
 *    `npm run generate --workspace=@growengine/db`; then copy
 *    packages/engine-db/drizzle → apps/grow/drizzle-engine. The two folders
 *    must stay identical (they are checked with diff in HANDOVER §8).
 */
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { applyMigrations, readMigrations } from "./lib/engine-migrations.mjs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(here, "..", "drizzle-engine");

/**
 * Columns the in-process workers cannot run without. Verified after the run
 * so the boot log states the one fact that matters, in plain words.
 */
const REQUIRED_COLUMNS = [
  ["queue_jobs", "available_at"],
  ["queue_jobs", "locked_by"],
  ["queue_jobs", "payload"],
  ["queue_jobs", "max_attempts"],
];

const log = (line) => console.log(`[migrate-engine] ${line}`);

async function main() {
  if (!process.env.DATABASE_URL) {
    log("DATABASE_URL not set — skipping engine schema.");
    return 0;
  }
  let mysql;
  try {
    mysql = require("mysql2/promise");
  } catch (e) {
    log(`mysql2 not resolvable — cannot run: ${e.message}`);
    return 1;
  }

  const migrations = readMigrations(MIGRATIONS_DIR);
  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 10_000 });
  try {
    const query = async (sql, params) => (await conn.query(sql, params))[0];
    const result = await applyMigrations(migrations, query, log);
    if (result.applied.length === 0) log(`engine schema up to date (${result.skipped.length} migration(s) recorded).`);

    const missing = [];
    for (const [table, column] of REQUIRED_COLUMNS) {
      const rows = await query(
        "select 1 from information_schema.columns where table_schema = database() and table_name = ? and column_name = ?",
        [table, column],
      );
      if (rows.length === 0) missing.push(`${table}.${column}`);
    }
    if (missing.length > 0) {
      log(`FAILED verification — missing after migration: ${missing.join(", ")}`);
      return 1;
    }
    log("verified: queue_jobs has its polling columns; in-process workers can run.");
    return 0;
  } finally {
    await conn.end().catch(() => {});
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    // Loud and specific, on stdout. `cause` is the mysql2 error (code, errno).
    log(`FAILED: ${err.message}`);
    if (err.statement) log(`statement: ${String(err.statement).slice(0, 300)}`);
    if (err.cause?.code && !String(err.message).includes(err.cause.code)) log(`cause: ${err.cause.code}`);
    process.exit(1);
  });
