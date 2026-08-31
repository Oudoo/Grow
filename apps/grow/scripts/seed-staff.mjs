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

/**
 * Every business module at `manage`, with `iam` deliberately absent (= none).
 * Mirrors ModuleKey in src/lib/access.ts, minus `iam` (user administration) and
 * minus `chatbot` (no route exists yet).
 *
 * NOTE: this grant is broad — finance, CRM and every client-facing module.
 * Confirm it against the holder's role before reusing it for someone new.
 */
const EXEC_ACCESS = {
  analytics: "manage",
  crm: "manage",
  finance: "manage",
  support: "manage",
  products: "manage",
  projects: "manage",
  branding: "manage",
  playbook: "manage",
  engine: "manage",
  producer: "manage",
};

/**
 * Every module at `manage`, INCLUDING `iam` — user administration and all
 * business modules. Mirrors the canonical MODULES list in src/lib/access.ts
 * (`chatbot` is omitted only because no route exists for it yet).
 *
 * Distinct from EXEC_ACCESS above, which withholds `iam` on purpose. Anyone
 * granted this can create accounts and change permissions, including their own.
 */
const FULL_ACCESS = { ...EXEC_ACCESS, iam: "manage" };

/**
 * Accounts granted an explicit per-module map, rather than SUPER_ADMIN.
 *
 * The distinction matters: SUPER_ADMIN implies `manage` on everything
 * automatically, so it cannot express "everything except user administration",
 * and it silently picks up any module added later. An explicit map says exactly
 * what was intended and stays that way.
 */
const EXECUTIVES = [
  {
    email: "basem.341@gmail.com",
    name: "Basem",
    // Marketing Manager, with deliberate access to every business module
    // including finance — reviewed and kept intentionally on 2026-08-31. Wider
    // than the job title implies, so do not "correct" it back down.
    // Shares STAFF_PASSWORD by request; set only when the account is created.
    get password() {
      return process.env.STAFF_PASSWORD;
    },
    access: EXEC_ACCESS,
  },
  {
    // CTO. Personal address on purpose — his @growcdx.com mailbox is pending
    // the domain transfer. Migrate him to the company address once that lands;
    // changing `email` here would create a SECOND account rather than rename
    // this one, so do it in the IAM Portal and remove this entry afterwards.
    email: "seifmohammed0123@gmail.com",
    name: "Seif Mohammed",
    get password() {
      return process.env.STAFF_PASSWORD;
    },
    access: FULL_ACCESS,
  },
];

/** Describe an executive entry by what it can actually do, for the boot log. */
function describe(exec) {
  const mods = Object.keys(exec.access).length;
  return exec.access.iam === "manage"
    ? `admin, all ${mods} modules incl. IAM`
    : `executive, ${mods} modules (no IAM)`;
}

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
    // ── Accounts with an explicit per-module access map ────────────────────
    // Role is ADMIN, not SUPER_ADMIN, because SUPER_ADMIN implicitly gets
    // `manage` everywhere and would override whatever the map says — which
    // matters for the account whose whole point is that `iam` is withheld.
    // Each entry carries its own map, so read the map to know what it can do.
    // Password is set only on creation, so later changes are never clobbered.
    for (const exec of EXECUTIVES) {
      if (!exec.password) continue;
      const existing = await prisma.adminUser.findUnique({ where: { email: exec.email } }).catch(() => null);
      const access = JSON.stringify(exec.access);
      if (existing) {
        await prisma.adminUser.update({
          where: { email: exec.email },
          data: { role: "ADMIN", isActive: true, access },
        });
        console.log(`[seed-staff] ensured ${describe(exec)}: ${exec.email}`);
      } else {
        await prisma.adminUser.create({
          data: {
            email: exec.email,
            name: exec.name,
            role: "ADMIN",
            isActive: true,
            access,
            passwordHash: hashPassword(exec.password),
          },
        });
        console.log(`[seed-staff] created ${describe(exec)}: ${exec.email}`);
      }
    }
  } catch (e) {
    console.warn("[seed-staff] skipped:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
