"use server";

import { assertAccess, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODULE_KEYS, type AccessLevel, type AccessMap, type UserRole } from "@/lib/access";
import { revalidatePath } from "next/cache";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  access: AccessMap;
  clientId: string | null;
  isActive: boolean;
  createdAt: Date;
};

const LEVELS: AccessLevel[] = ["none", "view", "manage"];
const ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "MEMBER", "VIEWER", "CLIENT"];

/**
 * Validate a role string from a form against the known set. Only a SUPER_ADMIN
 * caller may create or elevate someone to SUPER_ADMIN — this closes the
 * privilege-escalation path where any iam:manage delegate could mint a full
 * super admin (or elevate themselves).
 */
function resolveRole(raw: FormDataEntryValue | null, callerRole: string): UserRole {
  const role = (typeof raw === "string" && ROLES.includes(raw as UserRole) ? raw : "MEMBER") as UserRole;
  if (role === "SUPER_ADMIN" && callerRole !== "SUPER_ADMIN") {
    throw new Error("Only a Super Admin can grant the Super Admin role.");
  }
  return role;
}

/** Build the per-module access map from form fields `access_<module>`. */
function readAccessMap(formData: FormData): AccessMap {
  const map: AccessMap = {};
  for (const key of MODULE_KEYS) {
    const raw = formData.get(`access_${key}`);
    const level = typeof raw === "string" && LEVELS.includes(raw as AccessLevel) ? (raw as AccessLevel) : "none";
    if (level !== "none") map[key] = level;
  }
  return map;
}

/** Count active SUPER_ADMINs other than `exceptId` — used to protect the last one. */
async function otherActiveSuperAdmins(exceptId: string): Promise<number> {
  return prisma.adminUser.count({
    where: { role: "SUPER_ADMIN", isActive: true, id: { not: exceptId } },
  });
}

export async function createAdminUserAction(formData: FormData) {
  const caller = await assertAccess("iam", "manage");

  const email = (formData.get("email") as string).trim().toLowerCase();
  const name = (formData.get("name") as string).trim();
  const password = formData.get("password") as string;
  const role = resolveRole(formData.get("role"), caller.role);
  const clientId = ((formData.get("clientId") as string) || "").trim() || null;
  const access = readAccessMap(formData);

  if (!email || !name || !password) throw new Error("Missing required fields");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      access: JSON.stringify(access),
      clientId: role === "CLIENT" ? clientId : null,
      isActive: true,
    },
  });

  revalidatePath("/admin/iam");
}

export async function updateAdminUserAction(id: string, formData: FormData) {
  const caller = await assertAccess("iam", "manage");

  const name = (formData.get("name") as string).trim();
  const role = resolveRole(formData.get("role"), caller.role);
  const isActive = formData.get("isActive") === "true";
  const clientId = ((formData.get("clientId") as string) || "").trim() || null;
  const access = readAccessMap(formData);

  // Guard the last Super Admin: block demoting or deactivating them, and block
  // a Super Admin from locking themselves out.
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) throw new Error("User not found.");
  const demoting = target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN";
  const deactivating = target.isActive && !isActive;
  if (target.role === "SUPER_ADMIN" && (demoting || deactivating)) {
    if ((await otherActiveSuperAdmins(id)) === 0) {
      throw new Error("Cannot demote or deactivate the last active Super Admin.");
    }
  }
  if (caller.uid === id && deactivating) {
    throw new Error("You cannot deactivate your own account.");
  }

  const updateData: Record<string, unknown> = {
    name,
    role,
    isActive,
    access: JSON.stringify(access),
    clientId: role === "CLIENT" ? clientId : null,
  };

  const newPassword = formData.get("password") as string;
  if (newPassword && newPassword.length >= 8) {
    updateData.passwordHash = await hashPassword(newPassword);
  }

  await prisma.adminUser.update({ where: { id }, data: updateData });
  revalidatePath("/admin/iam");
}

export async function toggleAdminUserActiveAction(id: string, isActive: boolean) {
  const caller = await assertAccess("iam", "manage");

  if (!isActive) {
    if (caller.uid === id) throw new Error("You cannot deactivate your own account.");
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (target?.role === "SUPER_ADMIN" && (await otherActiveSuperAdmins(id)) === 0) {
      throw new Error("Cannot deactivate the last active Super Admin.");
    }
  }

  await prisma.adminUser.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/iam");
}

export async function deleteAdminUserAction(id: string) {
  const caller = await assertAccess("iam", "manage");

  if (caller.uid === id) throw new Error("You cannot delete your own account.");
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (target?.role === "SUPER_ADMIN" && (await otherActiveSuperAdmins(id)) === 0) {
    throw new Error("Cannot delete the last active Super Admin.");
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/iam");
}
