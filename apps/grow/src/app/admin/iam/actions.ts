"use server";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ALL_PERMISSIONS = ["crm", "finance", "products", "projects", "support", "analytics", "iam"] as const;

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
};

async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(plain), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations: 210_000 },
    keyMaterial,
    256,
  );
  const saltB64 = btoa(String.fromCharCode(...salt)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `pbkdf2$210000$${saltB64}$${hashB64}`;
}

export async function createAdminUserAction(formData: FormData) {
  await assertAuthenticated();

  const email = (formData.get("email") as string).trim().toLowerCase();
  const name = (formData.get("name") as string).trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const perms = ALL_PERMISSIONS.filter((p) => formData.get(`perm_${p}`) === "on");

  if (!email || !name || !password) throw new Error("Missing required fields");

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      permissions: JSON.stringify(perms),
      isActive: true,
    },
  });

  revalidatePath("/admin/iam");
}

export async function updateAdminUserAction(id: string, formData: FormData) {
  await assertAuthenticated();

  const name = (formData.get("name") as string).trim();
  const role = formData.get("role") as string;
  const isActive = formData.get("isActive") === "true";
  const perms = ALL_PERMISSIONS.filter((p) => formData.get(`perm_${p}`) === "on");

  const updateData: Record<string, unknown> = { name, role, isActive, permissions: JSON.stringify(perms) };

  const newPassword = formData.get("password") as string;
  if (newPassword && newPassword.length >= 8) {
    updateData.passwordHash = await hashPassword(newPassword);
  }

  await prisma.adminUser.update({ where: { id }, data: updateData });
  revalidatePath("/admin/iam");
}

export async function toggleAdminUserActiveAction(id: string, isActive: boolean) {
  await assertAuthenticated();
  await prisma.adminUser.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/iam");
}

export async function deleteAdminUserAction(id: string) {
  await assertAuthenticated();
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/iam");
}

export async function seedSuperAdminAction() {
  await assertAuthenticated();

  const email = "admin@grow.agency";
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await hashPassword(crypto.randomUUID());

  await prisma.adminUser.create({
    data: {
      email,
      name: "Grow Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      permissions: JSON.stringify(ALL_PERMISSIONS),
      isActive: true,
    },
  });

  revalidatePath("/admin/iam");
}
