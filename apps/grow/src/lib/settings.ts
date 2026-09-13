import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import {
  DEFAULT_TASK_PRIORITIES, DEFAULT_TASK_STATUSES, SETTING_KEYS,
  parsePriorities, parseStatuses,
  type PriorityOption, type SettingKey, type StatusOption,
} from "./config-types";

/**
 * Read and write admin-editable configuration.
 *
 * Every getter falls back to the built-in default — on a missing row, a corrupt
 * value, or a database error. Configuration must never be the reason a page
 * fails: the project board falling back to the standard three statuses is
 * always better than a 500.
 *
 * `cache()` dedupes reads within one request, so a page that needs statuses in
 * three places issues one query.
 */

const readRaw = cache(async (key: SettingKey): Promise<string | null> => {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key }, select: { value: true } });
    return row?.value ?? null;
  } catch (e) {
    console.error(`[settings] could not read ${key}:`, e);
    return null;
  }
});

export const getTaskStatuses = cache(async (): Promise<StatusOption[]> =>
  parseStatuses(await readRaw(SETTING_KEYS.taskStatuses)));

export const getTaskPriorities = cache(async (): Promise<PriorityOption[]> =>
  parsePriorities(await readRaw(SETTING_KEYS.taskPriorities)));

/** Both lists in one call — what most pages actually need. */
export async function getProjectConfig(): Promise<{
  statuses: StatusOption[];
  priorities: PriorityOption[];
}> {
  const [statuses, priorities] = await Promise.all([getTaskStatuses(), getTaskPriorities()]);
  return { statuses, priorities };
}

/** Whether a setting has been customised, so the UI can offer "reset". */
export async function isCustomised(key: SettingKey): Promise<boolean> {
  return (await readRaw(key)) !== null;
}

// ── writes ─────────────────────────────────────────────────────────────────

async function writeRaw(key: SettingKey, value: unknown, actorId: string): Promise<void> {
  const payload = JSON.stringify(value);
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value: payload, updatedBy: actorId },
    update: { value: payload, updatedBy: actorId },
  });
}

export async function saveTaskStatuses(next: StatusOption[], actorId: string): Promise<void> {
  await writeRaw(SETTING_KEYS.taskStatuses, next, actorId);
}

export async function saveTaskPriorities(next: PriorityOption[], actorId: string): Promise<void> {
  await writeRaw(SETTING_KEYS.taskPriorities, next, actorId);
}

/** Delete the row so the built-in default applies again. */
export async function resetSetting(key: SettingKey): Promise<void> {
  await prisma.systemSetting.deleteMany({ where: { key } });
}

// ── in-use protection ──────────────────────────────────────────────────────

/**
 * Which status ids are currently held by at least one task, with counts.
 *
 * Removing a status that tasks still use would leave them holding a value with
 * no definition: they would vanish from the board (no column matches) while
 * still existing in the database. Callers must refuse such an edit — this is
 * what tells them so, and lets the message name the affected count.
 */
export async function statusUsage(): Promise<Map<string, number>> {
  const usage = new Map<string, number>();
  try {
    const rows = await prisma.task.groupBy({ by: ["status"], _count: { status: true } });
    for (const r of rows) usage.set(r.status, r._count.status);
  } catch (e) {
    console.error("[settings] could not read status usage:", e);
  }
  return usage;
}

export async function priorityUsage(): Promise<Map<string, number>> {
  const usage = new Map<string, number>();
  try {
    const rows = await prisma.task.groupBy({ by: ["priority"], _count: { priority: true } });
    for (const r of rows) usage.set(r.priority, r._count.priority);
  } catch (e) {
    console.error("[settings] could not read priority usage:", e);
  }
  return usage;
}

/**
 * Ids that `next` drops but tasks still hold.
 *
 * Defaults are treated as removable when unused: a fresh install that has never
 * created a PENDING task can rename its workflow freely.
 */
export function removedInUse(
  next: { id: string }[],
  usage: Map<string, number>,
): { id: string; count: number }[] {
  const keeping = new Set(next.map((o) => o.id));
  const blocked: { id: string; count: number }[] = [];
  for (const [id, count] of usage) {
    if (count > 0 && !keeping.has(id)) blocked.push({ id, count });
  }
  return blocked;
}

export { DEFAULT_TASK_STATUSES, DEFAULT_TASK_PRIORITIES };


// ── Developer console: raw access to every setting ───────────────────────
// The console is the owner's escape hatch: it lists every SystemSetting row
// and lets the owner edit the JSON directly. Keys here are plain strings on
// purpose (the typed SettingKey union covers only what has an editor). Every
// typed getter above falls back to defaults on a malformed value, so a bad
// edit degrades a page rather than breaking it.

export interface RawSetting {
  key: string;
  value: string;
  updatedBy: string | null;
  updatedAt: Date;
}

export async function listAllSettings(): Promise<RawSetting[]> {
  try {
    return await prisma.systemSetting.findMany({ orderBy: { key: "asc" } });
  } catch (e) {
    console.error("[settings] could not list settings:", e);
    return [];
  }
}

/** Upsert any key with a JSON payload; the caller has validated the JSON. */
export async function writeAnySetting(key: string, jsonText: string, actorId: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value: jsonText, updatedBy: actorId },
    update: { value: jsonText, updatedBy: actorId },
  });
}

export async function deleteAnySetting(key: string): Promise<void> {
  await prisma.systemSetting.delete({ where: { key } }).catch(() => {});
}
