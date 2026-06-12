#!/usr/bin/env node
/**
 * Production start wrapper for Hostinger (and any host that runs `npm start`).
 *
 * Hostinger auto-deploys on every push to `main` but has no separate
 * "run migrations" step. So on boot we best-effort sync the live database to
 * prisma/schema.prisma BEFORE starting Next.js. This makes new tables/columns
 * (e.g. AdminUser, TenantConfig) appear automatically after a deploy — no SSH,
 * no manual `prisma migrate` needed.
 *
 * The sync is additive and non-destructive: `prisma db push` (without
 * --accept-data-loss) applies new tables/columns and refuses anything that
 * would drop data. If the DB is briefly unreachable at boot we log and start
 * Next.js anyway, so a transient hiccup never takes the whole site down.
 */
import { spawnSync } from "node:child_process";

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
}

if (process.env.DATABASE_URL) {
  console.log("[start] Syncing database schema (prisma db push)…");
  const push = run("npx", ["prisma", "db", "push", "--skip-generate"]);
  if (push.status !== 0) {
    console.warn("[start] Schema sync did not complete cleanly. Starting the app anyway.");
  } else {
    console.log("[start] Database schema is up to date.");
  }
} else {
  console.warn("[start] DATABASE_URL is not set — skipping schema sync.");
}

const next = run("npx", ["next", "start"]);
process.exit(next.status ?? 0);
