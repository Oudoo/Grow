#!/usr/bin/env node
/**
 * Production start wrapper for Hostinger (and any host that runs `npm start`).
 *
 * On boot we: (1) sync the SQLite schema to prisma/schema.prisma, (2) seed the
 * demo data if the database is empty, then (3) start Next.js. This makes a fresh
 * Hostinger deploy come up already populated, with no SSH or manual steps.
 *
 * Port: respects the host-assigned PORT; falls back to 3040 for local runs.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
}

// 1. Ensure the schema exists (creates the SQLite file / applies new columns).
console.log("[start] Syncing database schema (prisma db push)…");
const push = run("npx", ["prisma", "db", "push", "--skip-generate"]);
if (push.status !== 0) {
  console.warn("[start] Schema sync did not complete cleanly. Starting anyway.");
}

// 2. Seed demo data when the database is empty (idempotent across redeploys).
try {
  const require = createRequire(import.meta.url);
  const { PrismaClient } = require("../src/generated/prisma");
  const prisma = new PrismaClient();
  const count = await prisma.vacancy.count();
  await prisma.$disconnect();
  if (count === 0) {
    console.log("[start] Database is empty — seeding demo data…");
    run("node", ["scripts/seed.mjs"]);
  } else {
    console.log(`[start] Database already has ${count} vacancies — skipping seed.`);
  }
} catch (e) {
  console.warn("[start] Seed check skipped:", e.message);
}

// 3. Start Next.js. Next reads PORT from the environment; default to 3040 locally.
if (!process.env.PORT) process.env.PORT = "3040";
const next = run("npx", ["next", "start"]);
process.exit(next.status ?? 0);
