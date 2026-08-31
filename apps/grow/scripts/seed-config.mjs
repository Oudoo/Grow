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
 * One channel per converted client. Public, so anyone joining the team finds the
 * client conversations that already exist rather than having to be invited to
 * each. Created only if absent, so a renamed or deleted channel is not
 * resurrected on every boot.
 */
const CHANNELS = [
  { slug: "180-dental",        name: "180 Dental",        topic: "180 Dental & Cosmetics — Sheikh Zayed. Dual-sided: patients and chair rental." },
  { slug: "sportive-hub",      name: "Sportive Hub",      topic: "Sportive Hub — Elite Performance Center. Sheikh Zayed and Almaza Bay." },
  { slug: "nour-clinic-elite", name: "Nour Clinic Elite",  topic: "Nour Clinic Elite — Prof. Ahmed Adel Nour-Eldin. Induction pending." },
];

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
    } else {
      await conn.execute(
        "INSERT INTO SystemSetting (`key`, value, updatedBy) VALUES (?, ?, NULL)",
        [KEY, JSON.stringify(STATUSES)],
      );
      console.log(
        `[seed-config] seeded ${STATUSES.length} task statuses: ` +
          STATUSES.map((s) => s.label).join(", "),
      );
    }

    await seedChannels(conn);
  } finally {
    await conn.end();
  }
}

/**
 * Create a channel per converted client, if the chat tables exist.
 *
 * Every active staff account is joined, so the channels are populated rather
 * than empty rooms nobody has found. `lastReadAt` is set to now on join: a new
 * channel should not arrive showing unread messages that predate you.
 */
async function seedChannels(conn) {
  const [[{ n }]] = await conn.query(
    "SELECT COUNT(*) n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('Channel','ChannelMember')",
  );
  if (Number(n) < 2) {
    console.log("[seed-config] chat tables not present yet — skipping channels.");
    return;
  }

  const [staff] = await conn.execute(
    "SELECT id FROM AdminUser WHERE isActive = 1 AND role <> 'CLIENT'",
  );

  let created = 0;
  for (const ch of CHANNELS) {
    const [existing] = await conn.execute("SELECT id FROM Channel WHERE slug = ?", [ch.slug]);
    if (existing.length > 0) continue;

    const id = crypto.randomUUID();
    await conn.execute(
      "INSERT INTO Channel (id, slug, name, topic, isPrivate, createdById) VALUES (?, ?, ?, ?, 0, NULL)",
      [id, ch.slug, ch.name, ch.topic],
    );
    for (const u of staff) {
      await conn.execute(
        "INSERT INTO ChannelMember (id, channelId, userId, lastReadAt) VALUES (?, ?, ?, NOW(3))",
        [crypto.randomUUID(), id, u.id],
      );
    }
    created++;
    console.log(`[seed-config] created #${ch.slug} with ${staff.length} member(s)`);
  }

  if (created === 0) console.log("[seed-config] client channels already present.");
}

main().catch((e) => console.log("[seed-config] skipped:", e.message));
