"use server";

import { assertAccess, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MODULE_KEYS, type AccessLevel, type AccessMap } from "@/lib/access";
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

export async function createAdminUserAction(formData: FormData) {
  await assertAccess("iam", "manage");

  const email = (formData.get("email") as string).trim().toLowerCase();
  const name = (formData.get("name") as string).trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "MEMBER";
  const clientId = ((formData.get("clientId") as string) || "").trim() || null;
  const access = readAccessMap(formData);

  if (!email || !name || !password) throw new Error("Missing required fields");

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
  await assertAccess("iam", "manage");

  const name = (formData.get("name") as string).trim();
  const role = (formData.get("role") as string) || "MEMBER";
  const isActive = formData.get("isActive") === "true";
  const clientId = ((formData.get("clientId") as string) || "").trim() || null;
  const access = readAccessMap(formData);

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
  await assertAccess("iam", "manage");
  await prisma.adminUser.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/iam");
}

export async function deleteAdminUserAction(id: string) {
  await assertAccess("iam", "manage");
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/iam");
}
