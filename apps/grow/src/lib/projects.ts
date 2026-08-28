/**
 * Shared project-board vocabulary.
 *
 * Lives outside the actions file because a "use server" module may only export
 * async functions — a plain const there is a build error. Pure and dependency
 * free, so both server actions and client components can import it.
 */

export const PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ["PENDING", "IN_PROGRESS", "DONE"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

/**
 * Tailwind classes per priority. Colours are deliberately reserved for URGENT
 * and HIGH: if every priority is coloured, none of them reads as urgent.
 */
export const PRIORITY_STYLE: Record<Priority, string> = {
  URGENT: "bg-red-500/15 text-red-400 border-red-500/30",
  HIGH: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  MEDIUM: "bg-fg/5 text-slate border-fg/10",
  LOW: "bg-fg/5 text-slate/70 border-fg/10",
};

/** Board ordering: most urgent first. */
export const PRIORITY_RANK: Record<string, number> = {
  URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
};

export function normalisePriority(raw: unknown): Priority {
  return PRIORITIES.includes(raw as Priority) ? (raw as Priority) : "MEDIUM";
}

export function normaliseStatus(raw: unknown): Status | null {
  return STATUSES.includes(raw as Status) ? (raw as Status) : null;
}

/**
 * Calendar-day difference between a due date and today, both read in UTC.
 *
 * Due dates are stored at 12:00 UTC (see parseDueDate in the actions), so
 * comparing UTC day numbers gives the same answer in every timezone — a task
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

/** A task is overdue only while it is still open — a late-but-done task is done. */
export function isOverdue(due: Date | string | null | undefined, status: string): boolean {
  if (status === "DONE") return false;
  const days = daysUntilDue(due);
  return days !== null && days < 0;
}

/** Short human label for a due date: "Overdue by 3d", "Due today", "in 5d". */
export function dueLabel(due: Date | string | null | undefined, status: string): string | null {
  const days = daysUntilDue(due);
  if (days === null) return null;
  if (status === "DONE") return formatDueDate(due);
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
