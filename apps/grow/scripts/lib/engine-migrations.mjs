/**
 * Engine (Drizzle) migration bookkeeping — without drizzle-orm's migrate().
 *
 * WHY THIS EXISTS
 * ---------------
 * drizzle-orm's MySQL migrator runs every pending migration inside ONE
 * transaction and records a migration only after all of its statements have
 * succeeded. MySQL DDL commits implicitly, so a migration that fails on its
 * 200th statement leaves 199 objects created and NOTHING recorded. Every
 * later run then re-executes statement 1 — `CREATE TABLE …` — fails with
 * "already exists", and stops. Production sat like that for weeks: migration
 * 0000 (63 tables) applied but unrecorded, 0001 (the queue_jobs polling
 * columns) never applied, `__drizzle_migrations` empty, and five in-process
 * workers failing the same query ~7×/s into a 6.7 GB stderr.log. Found
 * 2026-09-12; see scripts/migrate-engine.mjs for the runner.
 *
 * So this applies migrations STATEMENT BY STATEMENT, treats "already exists"
 * as an outcome rather than a failure, records each migration the moment its
 * statements are all in place, and stops loudly on anything else. The
 * bookkeeping is byte-compatible with drizzle-orm — same table, same sha256
 * of the file, same created_at rule — so drizzle-kit and migrate() agree with
 * it.
 *
 * Pure functions here; the mysql2 connection lives in the runner. That keeps
 * this unit-testable without a database (engine-migrations.test.mjs).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const MIGRATIONS_TABLE = "__drizzle_migrations";

/** Identical to drizzle-orm's own DDL for its bookkeeping table. */
export const MIGRATIONS_TABLE_DDL =
  `create table if not exists \`${MIGRATIONS_TABLE}\` (id serial primary key, hash text not null, created_at bigint)`;

/** Split a migration file the way drizzle-orm does, minus empty fragments. */
export function splitStatements(text) {
  return text
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Read `meta/_journal.json` and each migration's SQL. `hash` is the sha256 of
 * the whole file and `folderMillis` the journal's `when`, exactly as
 * drizzle-orm computes them, so rows written from here are indistinguishable
 * from rows the standard migrator would have written.
 */
export function readMigrations(folder) {
  const journal = JSON.parse(readFileSync(join(folder, "meta", "_journal.json"), "utf8"));
  return journal.entries.map((entry) => {
    const text = readFileSync(join(folder, `${entry.tag}.sql`), "utf8");
    return {
      tag: entry.tag,
      folderMillis: Number(entry.when),
      hash: createHash("sha256").update(text).digest("hex"),
      statements: splitStatements(text),
    };
  });
}

/**
 * MySQL/MariaDB error numbers that mean "this DDL has already happened".
 * Anything not listed here is a real failure and must stop the run.
 */
const ALREADY_APPLIED = new Map([
  [1050, "table already exists"], // ER_TABLE_EXISTS_ERROR
  [1060, "column already exists"], // ER_DUP_FIELDNAME
  [1061, "index already exists"], // ER_DUP_KEYNAME
  [1826, "constraint already exists"], // ER_FK_DUP_NAME
  [1091, "already dropped"], // ER_CANT_DROP_FIELD_OR_KEY — a DROP that was applied earlier
]);

/**
 * Decide whether a statement's error means the object is already in place.
 * MariaDB reports a duplicate FOREIGN KEY name as 1005 "Can't create table
 * (errno: 121 …)" rather than 1826, hence the message check.
 */
export function classifyError(err) {
  const errno = Number(err?.errno);
  if (ALREADY_APPLIED.has(errno)) return { alreadyApplied: true, reason: ALREADY_APPLIED.get(errno) };
  if (errno === 1005 && /errno:\s*121\b/i.test(String(err?.message ?? ""))) {
    return { alreadyApplied: true, reason: "constraint already exists" };
  }
  return { alreadyApplied: false, reason: err?.code ? `${err.code} (${errno || "?"})` : String(err?.message ?? err) };
}

/**
 * Apply every migration newer than the last recorded one.
 *
 * `query(sql, params?)` must resolve to the result rows (mysql2: the first
 * element of `connection.query(...)`). `log(line)` receives one line per
 * migration outcome.
 *
 * Resolves `{ applied: [{tag, ran, existed}], skipped: [tag] }`. Rejects on
 * the first statement that fails for a reason other than "already applied";
 * the error carries `tag`, `statementIndex`, `statement` and `cause`, and the
 * migration is NOT recorded — so the next run resumes from the same place.
 */
export async function applyMigrations(migrations, query, log = () => {}) {
  await query(MIGRATIONS_TABLE_DDL);
  const rows = await query(`select max(created_at) as last from \`${MIGRATIONS_TABLE}\``);
  const last = Number(rows?.[0]?.last ?? 0) || 0;

  const summary = { applied: [], skipped: [] };
  for (const m of migrations) {
    // drizzle-orm's rule: a migration is pending while the newest recorded
    // created_at is older than its folderMillis.
    if (m.folderMillis <= last) {
      summary.skipped.push(m.tag);
      continue;
    }
    let ran = 0;
    let existed = 0;
    for (const [i, statement] of m.statements.entries()) {
      try {
        await query(statement);
        ran++;
      } catch (err) {
        const verdict = classifyError(err);
        if (!verdict.alreadyApplied) {
          const failure = new Error(
            `${m.tag} statement ${i + 1}/${m.statements.length} failed — ${verdict.reason}: ${err?.sqlMessage ?? err?.message ?? err}`,
          );
          failure.cause = err;
          failure.tag = m.tag;
          failure.statementIndex = i;
          failure.statement = statement;
          throw failure;
        }
        existed++;
      }
    }
    await query(`insert into \`${MIGRATIONS_TABLE}\` (\`hash\`, \`created_at\`) values (?, ?)`, [m.hash, m.folderMillis]);
    summary.applied.push({ tag: m.tag, ran, existed });
    log(`${m.tag}: ${ran} statement(s) applied, ${existed} already in place — recorded`);
  }
  return summary;
}
