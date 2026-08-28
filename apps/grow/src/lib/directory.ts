import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { can, parseAccess, type AccessLevel, type AccessMap, type ModuleKey, type UserRole } from "./access";

/**
 * The people directory — one source of truth for "who exists" across every
 * tool in the app.
 *
 * Before this, each tool carried its own hardcoded list of names (the project
 * board shipped with three), so adding someone in the IAM portal did not make
 * them selectable anywhere. Every owner/assignee/reviewer picker should now
 * read from here, so creating one IAM account makes that person appear
 * everywhere they have access — and deactivating it removes them everywhere.
 *
 * Server-only: it touches Prisma and must never reach the Edge middleware
 * bundle (see the note in lib/auth.ts).
 */

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  access: AccessMap;
  clientId: string | null;
}

/** Sentinel for "nobody owns this yet" — a real, selectable state. */
export const UNASSIGNED = "Unassigned";

/**
 * All active IAM accounts, ordered by name.
 *
 * `cache()` dedupes this within a single request/render, so a page that builds
 * several pickers issues one query rather than one per picker.
 *
 * Returns [] rather than throwing when the database is unreachable: a picker
 * that renders empty is far better than a page that 500s, and the same outage
 * is already reported properly by /api/health/db.
 */
export const listDirectory = cache(async (): Promise<DirectoryUser[]> => {
  try {
    const rows = await prisma.adminUser.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true, access: true, permissions: true, clientId: true },
      orderBy: { name: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: (r.role as UserRole) ?? "VIEWER",
      // Fall back to the legacy `permissions` array so accounts that predate
      // the per-module map still resolve to the right access.
      access: parseAccess(r.access ?? r.permissions),
      clientId: r.clientId,
    }));
  } catch (e) {
    console.error("[directory] listing active users failed:", e);
    return [];
  }
});

/**
 * Everyone who can open `module` at `level` — the correct population for an
 * owner picker. Assigning work to someone who cannot open the tool would
 * create a task they can never see.
 *
 * CLIENT accounts are excluded: they are external users scoped to their own
 * client, not staff who can be handed internal work.
 */
export async function directoryFor(
  module: ModuleKey,
  level: AccessLevel = "view",
): Promise<DirectoryUser[]> {
  const all = await listDirectory();
  return all.filter((u) => u.role !== "CLIENT" && can(u.role, u.access, module, level));
}

/** One directory entry by id, or null. */
export async function directoryUser(id: string | null | undefined): Promise<DirectoryUser | null> {
  if (!id) return null;
  const all = await listDirectory();
  return all.find((u) => u.id === id) ?? null;
}

/**
 * Resolve a free-text owner name to an IAM account.
 *
 * Needed to migrate data written before the IAM link, where the owner was
 * stored only as a display string. Matches on exact email first, then
 * case-insensitive full name.
 */
export async function resolveByName(name: string | null | undefined): Promise<DirectoryUser | null> {
  if (!name || name === UNASSIGNED) return null;
  const needle = name.trim().toLowerCase();
  if (!needle) return null;
  const all = await listDirectory();
  return (
    all.find((u) => u.email.toLowerCase() === needle) ??
    all.find((u) => u.name.trim().toLowerCase() === needle) ??
    null
  );
}

/** Shape handed to client components — no access map, no client scoping. */
export interface DirectoryOption {
  id: string;
  name: string;
  email: string;
}

/**
 * Picker options for a module, with "Unassigned" first.
 *
 * The empty-string id encodes Unassigned so a `<select>` can round-trip it as
 * a normal value; the action maps "" back to a null assigneeId.
 */
export async function pickerOptions(
  module: ModuleKey,
  level: AccessLevel = "view",
): Promise<DirectoryOption[]> {
  const users = await directoryFor(module, level);
  return [
    { id: "", name: UNASSIGNED, email: "" },
    ...users.map((u) => ({ id: u.id, name: u.name, email: u.email })),
  ];
}
