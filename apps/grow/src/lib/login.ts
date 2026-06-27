import "server-only";
import { prisma } from "./db";
import { signSession, setSessionCookie, verifyPasswordHash, hashPassword } from "./auth";
import { defaultLanding, parseAccess, type UserRole } from "./access";

/**
 * Server-only login (touches Prisma — never imported by Edge middleware).
 * Verifies an AdminUser's email + password and issues the signed session
 * cookie carrying their identity and per-module access.
 */

export interface LoginResult {
  ok: boolean;
  error?: string;
  /** Where this user should land after login (first module they can open). */
  landing?: string;
}

type UserRow = {
  id: string;
  role: string;
  access: string | null;
  permissions: string | null;
  clientId: string | null;
};

async function issueSession(user: UserRow): Promise<string> {
  const role = (user.role as UserRole) ?? "VIEWER";
  const access = parseAccess(user.access ?? user.permissions);
  const token = await signSession({
    uid: user.id,
    role,
    access,
    clientId: user.clientId ?? null,
  });
  await setSessionCookie(token);
  return defaultLanding(role, access);
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const normEmail = email.trim().toLowerCase();
  if (!normEmail || !password) return { ok: false, error: "Email and password are required." };

  // Bootstrap: on a fresh database with no users, the env super-admin
  // (ADMIN_EMAIL + ADMIN_PASSWORD) can sign in once, which creates that
  // account. Keeps a brand-new deploy reachable without manual seeding.
  const userCount = await prisma.adminUser.count().catch(() => -1);
  if (userCount === 0) {
    const bootEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const bootPass = process.env.ADMIN_PASSWORD?.trim();
    if (bootEmail && bootPass && normEmail === bootEmail && password === bootPass) {
      const created = await prisma.adminUser.create({
        data: {
          email: bootEmail,
          name: "Grow Super Admin",
          passwordHash: await hashPassword(bootPass),
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });
      const landing = await issueSession(created);
      return { ok: true, landing };
    }
  }

  const user = await prisma.adminUser.findUnique({ where: { email: normEmail } });
  if (!user || !user.isActive) return { ok: false, error: "Invalid email or password." };

  const valid = await verifyPasswordHash(password, user.passwordHash);
  if (!valid) return { ok: false, error: "Invalid email or password." };

  const landing = await issueSession(user);
  return { ok: true, landing };
}
