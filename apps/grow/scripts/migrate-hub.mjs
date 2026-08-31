#!/usr/bin/env node
/**
 * Hub schema bootstrap — additive DDL applied directly over mysql2.
 *
 * WHY THIS EXISTS, rather than just `prisma db push`:
 *
 * `prisma db push` needs Prisma's *schema-engine* binary, which is a separate
 * download from the query engine the app itself uses. On this host the push
 * step fails on every boot while the app's own queries work perfectly — the
 * failure was invisible because server.js logs that step's outcome with
 * console.warn, which lands in stderr.log, and that file has grown too large
 * to read. Three consecutive deploys reported "schema sync (prisma db push)…"
 * and then silently moved on.
 *
 * The engine's schema has the same problem and already solves it this way
 * (see migrate-engine.mjs): connect with mysql2 and run the DDL ourselves.
 *
 * Rules for anything added here:
 *   - ADDITIVE ONLY. Never drop or narrow a column. This runs unattended on
 *     every boot against production; a destructive statement here is data loss
 *     with no prompt and no review.
 *   - IDEMPOTENT. Every change checks information_schema first, so repeated
 *     boots are no-ops.
 *   - Definitions must match what Prisma would generate, so a future
 *     `prisma db push` (if the CLI is ever fixed) sees no drift.
 */
import "dotenv/config";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Columns to add: [table, column, definition] */
const COLUMNS = [
  // Task — IAM-linked owner, plus scheduling and prioritisation.
  ["Task", "assigneeId", "VARCHAR(191) NULL"],
  ["Task", "priority", "VARCHAR(191) NOT NULL DEFAULT 'MEDIUM'"],
  ["Task", "dueDate", "DATETIME(3) NULL"],
  ["Task", "completedAt", "DATETIME(3) NULL"],
  // Comment — IAM-linked author and the resolved @mention list.
  ["Comment", "authorId", "VARCHAR(191) NULL"],
  ["Comment", "mentions", "TEXT NULL"],
];

/** Tables to create: [table, createStatement] */
const TABLES = [
  [
    "Activity",
    `CREATE TABLE Activity (
       id        VARCHAR(191) NOT NULL,
       taskId    VARCHAR(191) NOT NULL,
       actorId   VARCHAR(191) NULL,
       actorName VARCHAR(191) NOT NULL DEFAULT 'System',
       kind      VARCHAR(191) NOT NULL,
       field     VARCHAR(191) NULL,
       fromValue TEXT NULL,
       toValue   TEXT NULL,
       createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
       PRIMARY KEY (id)
     )`,
  ],
  [
    "Notification",
    `CREATE TABLE Notification (
       id            VARCHAR(191) NOT NULL,
       userId        VARCHAR(191) NOT NULL,
       kind          VARCHAR(191) NOT NULL,
       title         VARCHAR(191) NOT NULL,
       body          TEXT NULL,
       url           TEXT NULL,
       taskId        VARCHAR(191) NULL,
       actorName     VARCHAR(191) NULL,
       readAt        DATETIME(3) NULL,
       emailedAt     DATETIME(3) NULL,
       emailAttempts INT NOT NULL DEFAULT 0,
       emailError    TEXT NULL,
       createdAt     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
       PRIMARY KEY (id)
     )`,
  ],
];

/** Tables to create (continued) — appended so the list stays chronological. */
TABLES.push([
  "SystemSetting",
  // `key` is a reserved word in MySQL/MariaDB, so it must be back-quoted in the
  // column definition as well as in the PRIMARY KEY clause.
  `CREATE TABLE SystemSetting (
     \`key\`   VARCHAR(191) NOT NULL,
     value     TEXT NOT NULL,
     updatedBy VARCHAR(191) NULL,
     updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
     PRIMARY KEY (\`key\`)
   )`,
]);

/** Team chat. */
TABLES.push(
  [
    "Channel",
    `CREATE TABLE Channel (
       id          VARCHAR(191) NOT NULL,
       slug        VARCHAR(191) NOT NULL,
       name        VARCHAR(191) NOT NULL,
       topic       TEXT NULL,
       isPrivate   TINYINT(1) NOT NULL DEFAULT 0,
       createdById VARCHAR(191) NULL,
       createdAt   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
       updatedAt   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
       PRIMARY KEY (id),
       UNIQUE KEY Channel_slug_key (slug)
     )`,
  ],
  [
    "ChannelMember",
    `CREATE TABLE ChannelMember (
       id         VARCHAR(191) NOT NULL,
       channelId  VARCHAR(191) NOT NULL,
       userId     VARCHAR(191) NOT NULL,
       lastReadAt DATETIME(3) NULL,
       joinedAt   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
       PRIMARY KEY (id),
       UNIQUE KEY ChannelMember_channelId_userId_key (channelId, userId)
     )`,
  ],
  [
    "ChatMessage",
    `CREATE TABLE ChatMessage (
       id         VARCHAR(191) NOT NULL,
       channelId  VARCHAR(191) NOT NULL,
       authorId   VARCHAR(191) NOT NULL,
       authorName VARCHAR(191) NOT NULL,
       body       TEXT NOT NULL,
       mentions   TEXT NULL,
       editedAt   DATETIME(3) NULL,
       createdAt  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
       PRIMARY KEY (id)
     )`,
  ],
);

/** Indexes to add: [table, indexName, columns] */
const INDEXES = [
  ["Task", "Task_assigneeId_idx", "(assigneeId)"],
  ["Task", "Task_dueDate_idx", "(dueDate)"],
  ["Task", "Task_projectId_status_idx", "(projectId, status)"],
  ["Comment", "Comment_taskId_createdAt_idx", "(taskId, createdAt)"],
  ["Activity", "Activity_taskId_createdAt_idx", "(taskId, createdAt)"],
  ["Notification", "Notification_userId_readAt_idx", "(userId, readAt)"],
  ["Notification", "Notification_emailedAt_emailAttempts_idx", "(emailedAt, emailAttempts)"],
  ["ChannelMember", "ChannelMember_userId_idx", "(userId)"],
  ["ChatMessage", "ChatMessage_channelId_createdAt_idx", "(channelId, createdAt)"],
];

/**
 * Foreign keys, added after their tables exist: [table, name, definition].
 * Separate from CREATE TABLE so a table created by an earlier run (before the
 * FK was declared) still picks it up.
 */
const FOREIGN_KEYS = [
  [
    "Activity",
    "Activity_taskId_fkey",
    "FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE ON UPDATE CASCADE",
  ],
  [
    "ChannelMember",
    "ChannelMember_channelId_fkey",
    "FOREIGN KEY (channelId) REFERENCES Channel(id) ON DELETE CASCADE ON UPDATE CASCADE",
  ],
  [
    "ChatMessage",
    "ChatMessage_channelId_fkey",
    "FOREIGN KEY (channelId) REFERENCES Channel(id) ON DELETE CASCADE ON UPDATE CASCADE",
  ],
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("[migrate-hub] DATABASE_URL not set — skipping.");
    return;
  }

  let mysql;
  try {
    mysql = require("mysql2/promise");
  } catch (e) {
    console.warn("[migrate-hub] mysql2 not resolvable — skipping:", e.message);
    return;
  }

  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
  let applied = 0;

  const exists = async (sql, params) => {
    const [rows] = await conn.execute(sql, params);
    return Number(rows[0]?.n ?? 0) > 0;
  };
  const hasTable = (t) =>
    exists("SELECT COUNT(*) n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [t]);
  const hasColumn = (t, c) =>
    exists(
      "SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
      [t, c],
    );
  const hasIndex = (t, i) =>
    exists(
      "SELECT COUNT(*) n FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?",
      [t, i],
    );
  const hasConstraint = (t, k) =>
    exists(
      "SELECT COUNT(*) n FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
      [t, k],
    );

  /** Run one DDL statement, logging but never rethrowing. */
  const run = async (label, sql) => {
    try {
      await conn.query(sql);
      applied++;
      console.log(`[migrate-hub] ${label}`);
    } catch (e) {
      console.warn(`[migrate-hub] ${label} FAILED: ${e.message}`);
    }
  };

  try {
    for (const [table, sql] of TABLES) {
      if (await hasTable(table)) continue;
      await run(`created table ${table}`, sql);
    }

    for (const [table, column, definition] of COLUMNS) {
      // A column on a table that does not exist is not an error worth shouting
      // about — the base schema simply has not been created yet.
      if (!(await hasTable(table))) continue;
      if (await hasColumn(table, column)) continue;
      await run(`added ${table}.${column}`, `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }

    for (const [table, name, cols] of INDEXES) {
      if (!(await hasTable(table))) continue;
      if (await hasIndex(table, name)) continue;
      await run(`indexed ${table} ${name}`, `CREATE INDEX ${name} ON ${table} ${cols}`);
    }

    for (const [table, name, definition] of FOREIGN_KEYS) {
      if (!(await hasTable(table))) continue;
      if (await hasConstraint(table, name)) continue;
      await run(`linked ${table} ${name}`, `ALTER TABLE ${table} ADD CONSTRAINT ${name} ${definition}`);
    }

    console.log(
      applied === 0
        ? "[migrate-hub] schema already up to date."
        : `[migrate-hub] schema ensured — ${applied} change(s) applied.`,
    );
  } finally {
    await conn.end();
  }
}

main().catch((e) => console.warn("[migrate-hub] skipped:", e.message));
