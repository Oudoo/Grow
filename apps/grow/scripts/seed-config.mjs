#!/usr/bin/env node
/**
 * Seed the default system configuration — once, and only if untouched.
 *
 * The configuration store treats "no row" as "use the built-in defaults", so
 * this writes a row only when none exists. That matters: once an admin edits
 * statuses in the Configuration screen the row is theirs, and a boot script
 * must never overwrite it. Every run after the first is a no-op.
 *
 * Adds the two statuses that were requested — Blocked, and Requires Client
 * Approval — to the default three, in workflow order. They could equally be
 * added through the UI in a few seconds; they are here so the deploy delivers
 * them rather than leaving a manual step.
 */
import "dotenv/config";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const KEY = "projects.taskStatuses";

/**
 * Order is column order on the board. Only a terminal state carries
 * isComplete — it stops a task counting as overdue and stamps completedAt, so
 * a waiting state like Blocked must NOT have it: work stuck behind someone else
 * is still late when it is late.
 */
const STATUSES = [
  { id: "PENDING",                   label: "Pending",                  color: "slate",  isComplete: false },
  { id: "IN_PROGRESS",               label: "In Progress",              color: "blue",   isComplete: false },
  { id: "BLOCKED",                   label: "Blocked",                  color: "red",    isComplete: false },
  { id: "REQUIRES_CLIENT_APPROVAL",  label: "Requires Client Approval", color: "amber",  isComplete: false },
  { id: "DONE",                      label: "Done",                     color: "green",  isComplete: true  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed-config] DATABASE_URL not set — skipping.");
    return;
  }

  let mysql;
  try {
    mysql = require("mysql2/promise");
  } catch (e) {
    console.log("[seed-config] mysql2 not resolvable — skipping:", e.message);
    return;
  }

  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
  try {
    const [[{ n }]] = await conn.query(
      "SELECT COUNT(*) n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'SystemSetting'",
    );
    if (Number(n) === 0) {
      console.log("[seed-config] SystemSetting not present yet — skipping.");
      return;
    }

    const [rows] = await conn.execute("SELECT `key` FROM SystemSetting WHERE `key` = ?", [KEY]);
    if (rows.length > 0) {
      console.log("[seed-config] task statuses already configured — leaving them alone.");
      return;
    }

    await conn.execute(
      "INSERT INTO SystemSetting (`key`, value, updatedBy) VALUES (?, ?, NULL)",
      [KEY, JSON.stringify(STATUSES)],
    );
    console.log(
      `[seed-config] seeded ${STATUSES.length} task statuses: ` +
        STATUSES.map((s) => s.label).join(", "),
    );
  } finally {
    await conn.end();
  }
}

main().catch((e) => console.log("[seed-config] skipped:", e.message));
