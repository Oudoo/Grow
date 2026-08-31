/**
 * Due-date arithmetic for the project board.
 *
 * Pure and dependency-free, so server actions and client components share one
 * implementation.
 *
 * This module used to also hold the status and priority vocabulary
 * (PRIORITIES, STATUS_LABEL, PRIORITY_STYLE, …). Those are now admin-editable
 * and live in lib/config-types.ts with the stored values read by lib/settings.ts
 * — keeping a hardcoded copy here as well would guarantee the two drift apart.
 */

/**
 * Calendar-day difference between a due date and today, both read in UTC.
 *
 * Due dates are stored at 12:00 UTC (see parseDueDate in the projects actions),
 * so comparing UTC day numbers gives the same answer in every timezone — a task
 * due "today" never reads as overdue for a colleague in another country.
 * Negative = overdue, 0 = due today.
 */
export function daysUntilDue(due: Date | string | null | undefined): number | null {
  if (!due) return null;
  const d = typeof due === "string" ? new Date(due) : due;
  if (Number.isNaN(d.getTime())) return null;
  const dueDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((dueDay - today) / 86_400_000);
}

/**
 * Ids that count as finished when no configuration is supplied.
 *
 * Statuses are admin-configurable (see lib/config-types.ts), so "complete" is a
 * flag on the configured status rather than the literal id "DONE". These
 * functions still accept the completed-id list as an optional argument, and fall
 * back to the built-in default, so callers that have no config to hand — and the
 * unit tests — behave exactly as before.
 */
const DEFAULT_COMPLETE_IDS = ["DONE"];

/** A task is overdue only while it is still open — a late-but-done task is done. */
export function isOverdue(
  due: Date | string | null | undefined,
  status: string,
  completeIds: string[] = DEFAULT_COMPLETE_IDS,
): boolean {
  if (completeIds.includes(status)) return false;
  const days = daysUntilDue(due);
  return days !== null && days < 0;
}

/** Short human label for a due date: "Overdue by 3d", "Due today", "in 5d". */
export function dueLabel(
  due: Date | string | null | undefined,
  status: string,
  completeIds: string[] = DEFAULT_COMPLETE_IDS,
): string | null {
  const days = daysUntilDue(due);
  if (days === null) return null;
  if (completeIds.includes(status)) return formatDueDate(due);
  if (days < 0) return `Overdue by ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days}d`;
  return formatDueDate(due);
}

/** Render a stored due date as YYYY-MM-DD, in UTC so the day never shifts. */
export function formatDueDate(due: Date | string | null | undefined): string | null {
  if (!due) return null;
  const d = typeof due === "string" ? new Date(due) : due;
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
