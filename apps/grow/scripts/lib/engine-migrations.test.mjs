import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  MIGRATIONS_TABLE,
  applyMigrations,
  classifyError,
  readMigrations,
  splitStatements,
} from "./engine-migrations.mjs";

/** A fake `query` that records statements and fails where told to. */
function fakeDb({ last = null, failures = {} } = {}) {
  const calls = [];
  const query = async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith("select max(created_at)")) return [{ last }];
    const err = failures[sql];
    if (err) throw err;
    return [];
  };
  return { query, calls };
}

const mysqlError = (errno, message = "boom") => Object.assign(new Error(message), { errno, code: `E${errno}`, sqlMessage: message });

describe("splitStatements", () => {
  it("splits on drizzle's breakpoint marker and drops empty fragments", () => {
    expect(splitStatements("A;--> statement-breakpoint\nB;--> statement-breakpoint\n")).toEqual(["A;", "B;"]);
  });
});

describe("readMigrations", () => {
  it("hashes the whole file and takes folderMillis from the journal, like drizzle-orm", () => {
    const dir = mkdtempSync(join(tmpdir(), "drz-"));
    mkdirSync(join(dir, "meta"));
    const sql = "CREATE TABLE a (id int);--> statement-breakpoint\nCREATE TABLE b (id int);";
    writeFileSync(join(dir, "0000_first.sql"), sql);
    writeFileSync(
      join(dir, "meta", "_journal.json"),
      JSON.stringify({ entries: [{ idx: 0, when: 1782313140403, tag: "0000_first", breakpoints: true }] }),
    );
    const [m] = readMigrations(dir);
    expect(m.tag).toBe("0000_first");
    expect(m.folderMillis).toBe(1782313140403);
    expect(m.hash).toBe(createHash("sha256").update(sql).digest("hex"));
    expect(m.statements).toHaveLength(2);
  });
});

describe("classifyError", () => {
  it("treats table/column/index/constraint duplicates as already applied", () => {
    for (const errno of [1050, 1060, 1061, 1826, 1091]) {
      expect(classifyError(mysqlError(errno)).alreadyApplied).toBe(true);
    }
  });
  it("recognises MariaDB's duplicate-foreign-key spelling (1005 / errno 121)", () => {
    expect(classifyError(mysqlError(1005, "Can't create table `x`.`y` (errno: 121 \"Duplicate key on write or update\")")).alreadyApplied).toBe(true);
    expect(classifyError(mysqlError(1005, "Can't create table (errno: 150 \"Foreign key constraint is incorrectly formed\")")).alreadyApplied).toBe(false);
  });
  it("is strict about everything else", () => {
    expect(classifyError(mysqlError(1054, "Unknown column")).alreadyApplied).toBe(false);
    expect(classifyError(mysqlError(1146, "Table doesn't exist")).alreadyApplied).toBe(false);
    expect(classifyError(new Error("ECONNREFUSED")).alreadyApplied).toBe(false);
  });
});

describe("applyMigrations", () => {
  const m0 = { tag: "0000", folderMillis: 100, hash: "h0", statements: ["CREATE TABLE t (id int);", "CREATE INDEX i ON t (id);"] };
  const m1 = { tag: "0001", folderMillis: 200, hash: "h1", statements: ["ALTER TABLE t ADD c int;"] };

  it("applies everything on a fresh database and records each migration", async () => {
    const db = fakeDb();
    const out = await applyMigrations([m0, m1], db.query);
    expect(out.applied).toEqual([
      { tag: "0000", ran: 2, existed: 0 },
      { tag: "0001", ran: 1, existed: 0 },
    ]);
    const inserts = db.calls.filter((c) => c.sql.startsWith("insert into"));
    expect(inserts.map((c) => c.params)).toEqual([["h0", 100], ["h1", 200]]);
    expect(db.calls[0].sql).toContain(`create table if not exists \`${MIGRATIONS_TABLE}\``);
  });

  it("resumes a half-applied, unrecorded migration: 'already exists' is an outcome, not a failure", async () => {
    // Production's exact state: 0000's objects exist, nothing recorded, 0001 pending.
    const db = fakeDb({
      failures: {
        "CREATE TABLE t (id int);": mysqlError(1050, "Table 't' already exists"),
        "CREATE INDEX i ON t (id);": mysqlError(1061, "Duplicate key name 'i'"),
      },
    });
    const out = await applyMigrations([m0, m1], db.query);
    expect(out.applied).toEqual([
      { tag: "0000", ran: 0, existed: 2 },
      { tag: "0001", ran: 1, existed: 0 },
    ]);
  });

  it("skips migrations already recorded, using drizzle's created_at rule", async () => {
    const db = fakeDb({ last: 100 });
    const out = await applyMigrations([m0, m1], db.query);
    expect(out.skipped).toEqual(["0000"]);
    expect(out.applied.map((a) => a.tag)).toEqual(["0001"]);
  });

  it("stops on a real failure, names the statement, and does NOT record the migration", async () => {
    const db = fakeDb({ failures: { "ALTER TABLE t ADD c int;": mysqlError(1146, "Table 't' doesn't exist") } });
    await expect(applyMigrations([m0, m1], db.query)).rejects.toMatchObject({
      tag: "0001",
      statementIndex: 0,
      message: expect.stringContaining("0001 statement 1/1 failed"),
    });
    const inserts = db.calls.filter((c) => c.sql.startsWith("insert into"));
    expect(inserts.map((c) => c.params)).toEqual([["h0", 100]]);
  });
});
