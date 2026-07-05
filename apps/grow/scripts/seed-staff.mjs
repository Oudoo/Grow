#!/usr/bin/env node
/**
 * Staff seed — ensures the founding team's IAM accounts exist as Super Admins
 * (full access to every module). Idempotent: runs on every boot, creating any
 * missing account and ensuring existing ones stay SUPER_ADMIN + active. It
 * only sets a password when creating an account, so a later password change is
 * never clobbered by a redeploy.
 *
 * Passwords come from the environment (never committed):
 *   STAFF_PASSWORD  — shared initial password for the team accounts below
 *   ADMIN_EMAIL/ADMIN_PASSWORD — the owner super-admin (optional)
 */
import "dotenv/config";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Matches the PBKDF2 format verified by src/lib/auth.ts. */
function hashPassword(plain) {
  const iterations = 210_000;
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, "sha256");
  return `pbkdf2$${iterations}$${b64url(salt)}$${b64url(hash)}`;
}

const TEAM = [
  { email: "mahmoud.hassan@growcdx.com", name: "Mahmoud Hassan" },
  { email: "ahmed.alaa@growcdx.com", name: "Dr. Ahmed Alaa" },
  { email: "shennawy@growcdx.com", name: "Dr. Shennawy" },
  { email: "danya.mohamed@growcdx.com", name: "Danya" },
  { email: "hana.mohamed@growcdx.com", name: "Hana" },
];

async function main() {
  const staffPassword = process.env.STAFF_PASSWORD;

  const accounts = [];
  // Owner super-admin (paired with the IAM bootstrap), if configured.
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    accounts.push({
      email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
      name: "Mahmoud Hassan",
      password: process.env.ADMIN_PASSWORD,
    });
  }
  if (staffPassword) {
    for (const t of TEAM) accounts.push({ ...t, email: t.email.toLowerCase(), password: staffPassword });
  } else {
    console.warn("[seed-staff] STAFF_PASSWORD not set — skipping team accounts.");
  }

  if (accounts.length === 0) return;

  const { PrismaClient } = require("../src/generated/prisma");
  const prisma = new PrismaClient();
  try {
    for (const u of accounts) {
      const existing = await prisma.adminUser.findUnique({ where: { email: u.email } }).catch(() => null);
      if (existing) {
        await prisma.adminUser.update({
          where: { email: u.email },
          data: { role: "SUPER_ADMIN", isActive: true },
        });
        console.log(`[seed-staff] ensured super admin: ${u.email}`);
      } else {
        await prisma.adminUser.create({
          data: {
            email: u.email,
            name: u.name,
            role: "SUPER_ADMIN",
            isActive: true,
            passwordHash: hashPassword(u.password),
          },
        });
        console.log(`[seed-staff] created super admin: ${u.email}`);
      }
    }
  } catch (e) {
    console.warn("[seed-staff] skipped:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
