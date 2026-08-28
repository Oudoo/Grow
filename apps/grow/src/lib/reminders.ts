import "server-only";
import { prisma } from "./db";
import { notifyUsers } from "./notify";
import { daysUntilDue } from "./projects";

/**
 * Due-date reminder sweep.
 *
 * Run on a schedule (see /api/notifications/dispatch). Finds open tasks that
 * are due soon or already late and queues a notification for their owner.
 *
 * Idempotency matters more than anything else here: a cron that fires hourly
 * must not email someone twelve times about one late task. Before queueing, we
 * check whether the same (task, owner, kind) was already notified inside the
 * look-back window, so re-running the sweep is harmless.
 */

/** Warn this many days ahead of a due date. */
const DUE_SOON_DAYS = 2;

/** One reminder per task per ~day, even if the sweep runs far more often. */
const DEDUPE_WINDOW_HOURS = 20;

export interface ReminderResult {
  dueSoon: number;
  overdue: number;
  skipped: number;
}

export async function sweepDueDates(): Promise<ReminderResult> {
  const result: ReminderResult = { dueSoon: 0, overdue: 0, skipped: 0 };

  // Only tasks that are open, owned, and dated can produce a reminder.
  // Bounded ahead of time so the query cannot scan the whole table as the
  // project history grows.
  const horizon = new Date(Date.now() + (DUE_SOON_DAYS + 1) * 86_400_000);

  let tasks;
  try {
    tasks = await prisma.task.findMany({
      where: {
        status: { not: "DONE" },
        assigneeId: { not: null },
        dueDate: { not: null, lte: horizon },
      },
      select: { id: true, title: true, dueDate: true, assigneeId: true, projectId: true },
      take: 500,
    });
  } catch (e) {
    console.error("[reminders] scanning due tasks failed:", e);
    return result;
  }

  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 3_600_000);

  for (const t of tasks) {
    const days = daysUntilDue(t.dueDate);
    if (days === null || !t.assigneeId) continue;

    const kind = days < 0 ? "overdue" : days <= DUE_SOON_DAYS ? "due_soon" : null;
    if (!kind) continue;

    // Already told them recently? Leave it alone.
    let recent = 0;
    try {
      recent = await prisma.notification.count({
        where: { userId: t.assigneeId, taskId: t.id, kind, createdAt: { gte: since } },
      });
    } catch (e) {
      console.error("[reminders] dedupe check failed:", e);
      continue;
    }
    if (recent > 0) {
      result.skipped++;
      continue;
    }

    const title =
      kind === "overdue"
        ? `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}: ${t.title}`
        : days === 0
          ? `Due today: ${t.title}`
          : `Due in ${days} day${days === 1 ? "" : "s"}: ${t.title}`;

    // actorId is omitted: these are system reminders with no human actor, so
    // the owner must receive them even though nobody "did" anything.
    const sent = await notifyUsers([t.assigneeId], {
      kind,
      title,
      url: `/admin/projects/${t.projectId}?task=${t.id}`,
      taskId: t.id,
      actorName: "GROW",
    });

    if (sent > 0) {
      if (kind === "overdue") result.overdue++;
      else result.dueSoon++;
    }
  }

  return result;
}
