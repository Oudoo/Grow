#!/usr/bin/env node
/**
 * Link task owners to IAM accounts — automatically, on every boot.
 *
 * Tasks created before owners were IAM accounts carry only a display name
 * ("Mahmoud Hassan"), with no assigneeId. Those tasks never appear in My Work
 * and their owner is never notified, so the link matters.
 *
 * This ran as a button in the projects dashboard, which meant it only happened
 * if somebody noticed the banner and pressed it. The same gap reopens every
 * time a task is imported or seeded from a name, so it belongs in the boot
 * sequence rather than in a human's memory. The button stays for on-demand
 * repair and reporting.
 *
 * Idempotent and cheap: the WHERE clause matches only unlinked, named tasks,
 * so a healthy database does no writes at all. Runs AFTER seed-staff, because
 * it can only match against accounts that already exist.
 */
import "dotenv/config";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[link-owners] DATABASE_URL not set — skipping.");
    return;
  }

  let mysql;
  try {
    mysql = require("mysql2/promise");
  } catch (e) {
    console.log("[link-owners] mysql2 not resolvable — skipping:", e.message);
    return;
  }

  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
  try {
    // The Task/AdminUser tables may not exist yet on a brand-new database.
    const [[{ n }]] = await conn.query(
      "SELECT COUNT(*) n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('Task','AdminUser')",
    );
    if (Number(n) < 2) {
      console.log("[link-owners] Task/AdminUser not present yet — skipping.");
      return;
    }

    const [orphans] = await conn.execute(
      "SELECT id, assignee FROM Task WHERE assigneeId IS NULL AND assignee <> 'Unassigned' AND assignee <> ''",
    );
    if (orphans.length === 0) {
      console.log("[link-owners] all task owners already linked.");
      return;
    }

    const [users] = await conn.execute(
      "SELECT id, name, email FROM AdminUser WHERE isActive = 1",
    );
    // Match on email first, then full name — same precedence as
    // resolveByName() in src/lib/directory.ts, so the automatic pass and the
    // manual button can never disagree about who a name refers to.
    const byKey = new Map();
    for (const u of users) {
      byKey.set(u.email.trim().toLowerCase(), u);
      byKey.set(u.name.trim().toLowerCase(), u);
    }

    let linked = 0;
    const unmatched = new Set();
    for (const t of orphans) {
      const hit = byKey.get(String(t.assignee).trim().toLowerCase());
      if (!hit) {
        unmatched.add(t.assignee);
        continue;
      }
      await conn.execute("UPDATE Task SET assigneeId = ?, assignee = ? WHERE id = ?", [
        hit.id,
        hit.name,
        t.id,
      ]);
      linked++;
    }

    console.log(`[link-owners] linked ${linked} of ${orphans.length} task(s).`);
    if (unmatched.size > 0) {
      // Not an error: a task can legitimately name someone who has no account.
      // Say so plainly so it can be reassigned rather than silently ignored.
      console.log(
        `[link-owners] no account matches: ${[...unmatched].join(", ")} — ` +
          "create the account in the IAM Portal or reassign the task.",
      );
    }
  } finally {
    await conn.end();
  }
}

main().catch((e) => console.log("[link-owners] skipped:", e.message));
