"use server";

import { assertAccess } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  SETTING_KEYS, validatePriorities, validateStatuses,
  type PriorityOption, type StatusOption,
} from "@/lib/config-types";
import {
  priorityUsage, removedInUse, resetSetting,
  saveTaskPriorities, saveTaskStatuses, statusUsage,
} from "@/lib/settings";

/**
 * Configuration actions.
 *
 * Every write validates the whole list server-side before storing it — the
 * browser sends JSON, and the client-side form is a convenience, not a
 * boundary. Errors come back as messages for the admin rather than thrown, so
 * the form can show them next to the field.
 */

export interface SaveResult {
  ok: boolean;
  error?: string;
}

/**
 * Refuse to drop an option that tasks still hold.
 *
 * A task whose status no longer exists in the configuration matches no column
 * and disappears from the board while still sitting in the database. Blocking
 * the edit is far kinder than letting work go invisible.
 */
function blockedMessage(
  blocked: { id: string; count: number }[],
  noun: string,
): string {
  const parts = blocked.map(
    (b) => `${b.id} (${b.count} ${b.count === 1 ? "task" : "tasks"})`,
  );
  return (
    `Cannot remove ${parts.join(", ")} — ${
      blocked.length === 1 ? "it is" : "they are"
    } still in use. ` +
    `Move those tasks to another ${noun} first, then remove it.`
  );
}

export async function saveStatusesAction(payload: string): Promise<SaveResult> {
  const actor = await assertAccess("settings", "manage");

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return { ok: false, error: "Could not read the submitted statuses." };
  }

  const result = validateStatuses(parsed);
  if (!result.ok || !result.value) return { ok: false, error: result.error };

  const blocked = removedInUse(result.value, await statusUsage());
  if (blocked.length > 0) return { ok: false, error: blockedMessage(blocked, "status") };

  await saveTaskStatuses(result.value as StatusOption[], actor.uid);
  revalidateProjects();
  return { ok: true };
}

export async function savePrioritiesAction(payload: string): Promise<SaveResult> {
  const actor = await assertAccess("settings", "manage");

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return { ok: false, error: "Could not read the submitted priorities." };
  }

  const result = validatePriorities(parsed);
  if (!result.ok || !result.value) return { ok: false, error: result.error };

  const blocked = removedInUse(result.value, await priorityUsage());
  if (blocked.length > 0) return { ok: false, error: blockedMessage(blocked, "priority") };

  await saveTaskPriorities(result.value as PriorityOption[], actor.uid);
  revalidateProjects();
  return { ok: true };
}

/** Restore the built-in list by deleting the stored override. */
export async function resetStatusesAction(): Promise<SaveResult> {
  await assertAccess("settings", "manage");
  // Same in-use rule: resetting is a removal for any custom status in play.
  const { DEFAULT_TASK_STATUSES } = await import("@/lib/config-types");
  const blocked = removedInUse(DEFAULT_TASK_STATUSES, await statusUsage());
  if (blocked.length > 0) return { ok: false, error: blockedMessage(blocked, "status") };

  await resetSetting(SETTING_KEYS.taskStatuses);
  revalidateProjects();
  return { ok: true };
}

export async function resetPrioritiesAction(): Promise<SaveResult> {
  await assertAccess("settings", "manage");
  const { DEFAULT_TASK_PRIORITIES } = await import("@/lib/config-types");
  const blocked = removedInUse(DEFAULT_TASK_PRIORITIES, await priorityUsage());
  if (blocked.length > 0) return { ok: false, error: blockedMessage(blocked, "priority") };

  await resetSetting(SETTING_KEYS.taskPriorities);
  revalidateProjects();
  return { ok: true };
}

/** Every surface that renders a status or priority. */
function revalidateProjects() {
  revalidatePath("/admin/configuration");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/my-work");
  // Individual project pages are dynamic; the layout path covers their shell
  // and each page re-queries on navigation.
  revalidatePath("/admin/projects/[id]", "page");
}
