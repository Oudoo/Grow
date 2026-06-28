#!/usr/bin/env node
/**
 * Engine schema bootstrap. The Grow Engine's 63 MySQL tables are managed by
 * Drizzle (not Prisma), so `prisma db push` doesn't create them. This runs the
 * Drizzle migrator against the production DB on boot, co-located with the app
 * (./drizzle-engine), creating/upgrading the engine schema idempotently.
 *
 * It is failure-tolerant: any error is logged and swallowed so a schema hiccup
 * never blocks the web server from starting. If the engine tables already
 * exist the migrator simply errors out (caught) — the rest of the app is fine.
 */
import "dotenv/config";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("[migrate-engine] DATABASE_URL not set — skipping engine schema.");
    return;
  }
  let mysql, drizzle, migrate;
  try {
    mysql = require("mysql2/promise");
    ({ drizzle } = require("drizzle-orm/mysql2"));
    ({ migrate } = require("drizzle-orm/mysql2/migrator"));
  } catch (e) {
    console.warn("[migrate-engine] drizzle/mysql2 not resolvable — skipping:", e.message);
    return;
  }

  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true });
  try {
    const db = drizzle(conn);
    await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle-engine") });
    console.log("[migrate-engine] engine schema ensured.");
  } finally {
    await conn.end();
  }
}

main().catch((e) => console.warn("[migrate-engine] skipped:", e.message));
