/**
 * Pure activity types and formatting.
 *
 * Split out of lib/activity.ts because that module is `server-only` (it touches
 * Prisma) and the timeline that renders this history is a client component —
 * importing the server module from the client is a build error. Everything here
 * is dependency free and safe on both sides.
 */

export interface ActivityRow {
  id: string;
  actorName: string;
  kind: string;
  field: string | null;
  fromValue: string | null;
  toValue: string | null;
  createdAt: Date;
}

/**
 * One-line summary of an event. Kept in one place so the board, the My Work
 * page and any future digest email phrase history identically.
 */
export function describeActivity(a: Pick<ActivityRow, "kind" | "field" | "fromValue" | "toValue">): string {
  const to = a.toValue ?? "—";
  const from = a.fromValue ?? "—";
  switch (a.kind) {
    case "created":    return "created this task";
    case "status":     return `moved it from ${from} to ${to}`;
    case "assignee":   return `reassigned it from ${from} to ${to}`;
    case "priority":   return `changed priority from ${from} to ${to}`;
    case "due":        return a.toValue ? `set the due date to ${to}` : "cleared the due date";
    case "title":      return `renamed it to “${to}”`;
    case "comment":    return "commented";
    case "subtask":
      if (to === "removed") return "removed a subtask";
      if (to === "added") return "added a subtask";
      return a.field ? `${to} “${a.field}”` : `${to} a subtask`;
    case "attachment": return to === "removed" ? "removed a link" : `attached “${to}”`;
    default:           return "updated the task";
  }
}
