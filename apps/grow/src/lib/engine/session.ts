import "server-only";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, tenants, users, clients } from "@growengine/db";
import { getSession } from "@/lib/auth";
import { accessLevel } from "@/lib/access";

/**
 * Engine session shim. The Grow Engine no longer has its own NextAuth login —
 * every human is a hub `AdminUser`. This module maps the unified hub session
 * onto the `SessionUser` shape the engine's 27 pages/actions already expect,
 * pins everything to a single "GROW" tenant, and mirrors the hub user into the
 * engine `users` table so engine foreign keys (createdBy, assigneeId, …) hold.
 */

export type SessionUser = {
  id: string;
  tenantId: string;
  tenantSlug: string;
  isSuperAdmin: boolean;
  clientId: string | null;
  permissions: string[];
  roleNames: string[];
  email?: string | null;
  name?: string | null;
};

const GROW_TENANT_SLUG = "grow";

/** Engine RBAC keys granted to read-only ("view") engine users. */
const READ_PERMISSIONS = [
  "clients:read", "integrations:read", "meetings:read", "intelligence:read",
  "creative:read", "work:read", "aom:read", "billing:read",
];

let cachedTenant: { id: string; slug: string } | null = null;
const mirrored = new Set<string>();

/** The single GROW tenant — created on first access, then cached. */
async function ensureGrowTenant(): Promise<{ id: string; slug: string }> {
  if (cachedTenant) return cachedTenant;
  const found = await db
    .select({ id: tenants.id, slug: tenants.slug })
    .from(tenants)
    .where(eq(tenants.slug, GROW_TENANT_SLUG))
    .limit(1);
  if (found[0]) {
    cachedTenant = found[0];
    return cachedTenant;
  }
  const id = randomUUID();
  await db
    .insert(tenants)
    .values({ id, name: "GROW", slug: GROW_TENANT_SLUG })
    .onDuplicateKeyUpdate({ set: { slug: GROW_TENANT_SLUG } });
  const reread = await db
    .select({ id: tenants.id, slug: tenants.slug })
    .from(tenants)
    .where(eq(tenants.slug, GROW_TENANT_SLUG))
    .limit(1);
  cachedTenant = reread[0] ?? { id, slug: GROW_TENANT_SLUG };
  return cachedTenant;
}

/** Mirror the hub user into the engine `users` table (idempotent, once/proc). */
async function mirrorUser(
  uid: string,
  tenantId: string,
  data: { email: string; name: string; isSuperAdmin: boolean; clientId: string | null }
): Promise<void> {
  if (mirrored.has(uid)) return;
  try {
    await db
      .insert(users)
      .values({
        id: uid,
        tenantId,
        email: data.email,
        name: data.name,
        isSuperAdmin: data.isSuperAdmin,
        clientId: data.clientId,
        status: "active",
      })
      .onDuplicateKeyUpdate({
        set: { name: data.name, isSuperAdmin: data.isSuperAdmin, clientId: data.clientId },
      });
    mirrored.add(uid);
  } catch {
    /* mirroring is best-effort; never block a page render */
  }
}

/** Require any authenticated user (resolved from the hub session). */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const tenant = await ensureGrowTenant();
  const isSuperAdmin = session.role === "SUPER_ADMIN";
  const engineLevel = accessLevel(session.role, session.access, "engine");
  const isManager = isSuperAdmin || engineLevel === "manage";

  await mirrorUser(session.uid, tenant.id, {
    email: session.email,
    name: session.name,
    isSuperAdmin,
    clientId: session.clientId ?? null,
  });

  return {
    id: session.uid,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    isSuperAdmin,
    clientId: session.clientId ?? null,
    // Managers map to the engine "Admin" role (passes every permission check);
    // viewers get the read-only permission set.
    roleNames: isManager ? ["Admin"] : engineLevel === "view" ? ["Viewer"] : [],
    permissions: isManager ? [] : engineLevel === "view" ? READ_PERMISSIONS : [],
    email: session.email,
    name: session.name,
  };
}

/** Require an internal team member; client-portal users go to their portal. */
export async function requireTeamUser(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.clientId) {
    const row = await db
      .select({ slug: clients.slug })
      .from(clients)
      .where(eq(clients.id, user.clientId))
      .limit(1);
    redirect(row[0]?.slug ? `/engine/client/${row[0].slug}` : "/admin/login");
  }
  return user;
}

/** Require a specific RBAC permission key (managers pass everything). */
export async function requirePermission(permission: string): Promise<SessionUser> {
  const user = await requireTeamUser();
  if (user.isSuperAdmin || user.roleNames.includes("Admin")) return user;
  if (!user.permissions.includes(permission)) redirect("/engine/dashboard?error=forbidden");
  return user;
}

export function hasPermission(user: SessionUser, permission: string): boolean {
  return (
    user.isSuperAdmin || user.roleNames.includes("Admin") || user.permissions.includes(permission)
  );
}
