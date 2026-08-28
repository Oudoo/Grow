"use server";

import { assertAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { directoryFor, resolveByName, UNASSIGNED } from "@/lib/directory";
import { mentionedUserIds } from "@/lib/mentions";
import { dispatchInBackground, notifyUsers } from "@/lib/notify";
import { recordActivity, taskActivity } from "@/lib/activity";
import type { ActivityRow } from "@/lib/activity-format";
import type { SessionPayload } from "@/lib/auth";
import { normalisePriority, normaliseStatus, STATUS_LABEL } from "@/lib/projects";

/**
 * Project board server actions.
 *
 * Three cross-cutting rules, applied to every mutation below:
 *
 *  1. **Identity comes from the session, never the client.** The old
 *     addCommentAction took the author name as an argument from the browser,
 *     which let anyone post as anyone. Actor identity is now read from the
 *     verified session on the server.
 *  2. **Ownership is an IAM account.** `assigneeId` is the truth; `assignee`
 *     is a denormalised display name kept in sync on every write.
 *  3. **Side effects never fail the write.** Activity rows and notifications
 *     are recorded after the change lands and swallow their own errors.
 */

/**
 * Parse a <input type="date"> value ("YYYY-MM-DD") into a Date.
 *
 * Anchored at 12:00 UTC rather than midnight: a date stored at 00:00Z renders
 * as the *previous* day for anyone west of Greenwich, so a task due the 15th
 * would show as due the 14th. Noon keeps the calendar date stable across the
 * whole ±12h range of real timezones.
 */
function parseDueDate(raw: FormDataEntryValue | null): Date | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Stable, timezone-independent rendering of a due date for history + email. */
function formatDue(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function taskUrl(projectId: string, taskId: string): string {
  return `/admin/projects/${projectId}?task=${taskId}`;
}

/** Revalidate every surface a task change is visible on. */
function revalidateTask(projectId: string) {
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/my-work");
}

/**
 * Resolve a submitted assignee id to an IAM account.
 *
 * Only accounts that can actually open the projects module are accepted —
 * assigning work to someone who cannot see the board would create a task
 * nobody can act on. An empty/unknown id means Unassigned.
 */
async function resolveAssignee(rawId: unknown): Promise<{ id: string | null; name: string }> {
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!id) return { id: null, name: UNASSIGNED };
  const allowed = await directoryFor("projects", "view");
  const match = allowed.find((u) => u.id === id);
  return match ? { id: match.id, name: match.name } : { id: null, name: UNASSIGNED };
}

/** Notify a newly assigned owner (no-op when unassigned or self-assigned). */
async function notifyAssignment(
  actor: SessionPayload,
  assigneeId: string | null,
  task: { id: string; title: string; projectId: string },
) {
  if (!assigneeId) return;
  await notifyUsers(
    [assigneeId],
    {
      kind: "assigned",
      title: `${actor.name} assigned you: ${task.title}`,
      body: "You have been made the owner of this task.",
      url: taskUrl(task.projectId, task.id),
      taskId: task.id,
      actorName: actor.name,
    },
    actor.uid,
  );
}

/**
 * Notify everyone named in `text`, plus (optionally) the task owner.
 * Returns the resolved mention ids so the caller can persist them.
 */
async function notifyMentions(
  actor: SessionPayload,
  text: string,
  task: { id: string; title: string; projectId: string; assigneeId: string | null },
  opts: { alsoOwner?: boolean; kind: "mention" | "comment"; title: string } = {
    kind: "mention",
    title: "You were mentioned",
  },
): Promise<string[]> {
  const directory = await directoryFor("projects", "view");
  const mentioned = mentionedUserIds(text, directory);

  if (mentioned.length > 0) {
    await notifyUsers(
      mentioned,
      {
        kind: "mention",
        title: `${actor.name} mentioned you in: ${task.title}`,
        body: text.slice(0, 600),
        url: taskUrl(task.projectId, task.id),
        taskId: task.id,
        actorName: actor.name,
      },
      actor.uid,
    );
  }

  // The owner hears about activity on their task, unless they were already
  // mentioned explicitly (one email per event, never two).
  if (opts.alsoOwner && task.assigneeId && !mentioned.includes(task.assigneeId)) {
    await notifyUsers(
      [task.assigneeId],
      {
        kind: opts.kind,
        title: `${actor.name} ${opts.title}: ${task.title}`,
        body: text.slice(0, 600),
        url: taskUrl(task.projectId, task.id),
        taskId: task.id,
        actorName: actor.name,
      },
      actor.uid,
    );
  }

  return mentioned;
}

// ── Projects ───────────────────────────────────────────────────────────────

export async function createProjectAction(formData: FormData) {
  await assertAccess("projects", "manage");
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  if (!title) return;

  await prisma.project.create({ data: { title, description: description || null } });
  revalidatePath("/admin/projects");
}

export async function deleteProjectAction(id: string) {
  await assertAccess("projects", "manage");
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function createTaskAction(projectId: string, formData: FormData) {
  const actor = await assertAccess("projects", "manage");
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  const description = ((formData.get("description") as string) ?? "").trim();
  const assignee = await resolveAssignee(formData.get("assigneeId"));
  const priority = normalisePriority(formData.get("priority"));
  const dueDate = parseDueDate(formData.get("dueDate"));

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      assignee: assignee.name,
      assigneeId: assignee.id,
      priority,
      dueDate,
      projectId,
    },
  });

  await recordActivity({
    taskId: task.id, actorId: actor.uid, actorName: actor.name,
    kind: "created", to: title,
  });
  await notifyAssignment(actor, assignee.id, task);
  if (description) {
    await notifyMentions(actor, description, { ...task, assigneeId: assignee.id });
  }

  revalidateTask(projectId);
  dispatchInBackground();
}

export async function updateTaskStatusAction(id: string, projectId: string, status: string) {
  const actor = await assertAccess("projects", "manage");
  const next = normaliseStatus(status);
  if (!next) return;

  const before = await prisma.task.findUnique({
    where: { id },
    select: { status: true, title: true, assigneeId: true },
  });
  if (!before || before.status === next) return;

  await prisma.task.update({
    where: { id },
    data: {
      status: next,
      // Stamp the completion time on the transition into DONE, and clear it
      // when a task is reopened so cycle-time reporting stays truthful.
      completedAt: next === "DONE" ? new Date() : null,
    },
  });

  await recordActivity({
    taskId: id, actorId: actor.uid, actorName: actor.name, kind: "status",
    from: STATUS_LABEL[before.status] ?? before.status,
    to: STATUS_LABEL[next] ?? next,
  });

  // Tell the owner their task moved — someone else closing your work is
  // exactly the kind of change you want to hear about.
  if (before.assigneeId) {
    await notifyUsers(
      [before.assigneeId],
      {
        kind: "status",
        title: `${actor.name} moved “${before.title}” to ${STATUS_LABEL[next] ?? next}`,
        url: taskUrl(projectId, id),
        taskId: id,
        actorName: actor.name,
      },
      actor.uid,
    );
  }

  revalidateTask(projectId);
  dispatchInBackground();
}

export async function updateTaskAssigneeAction(id: string, projectId: string, assigneeId: string) {
  const actor = await assertAccess("projects", "manage");
  const next = await resolveAssignee(assigneeId);

  const before = await prisma.task.findUnique({
    where: { id },
    select: { assignee: true, assigneeId: true, title: true },
  });
  if (!before || before.assigneeId === next.id) return;

  await prisma.task.update({
    where: { id },
    data: { assignee: next.name, assigneeId: next.id },
  });

  await recordActivity({
    taskId: id, actorId: actor.uid, actorName: actor.name, kind: "assignee",
    from: before.assignee, to: next.name,
  });
  await notifyAssignment(actor, next.id, { id, title: before.title, projectId });

  revalidateTask(projectId);
  dispatchInBackground();
}

export async function updateTaskPriorityAction(id: string, projectId: string, priority: string) {
  const actor = await assertAccess("projects", "manage");
  const next = normalisePriority(priority);

  const before = await prisma.task.findUnique({ where: { id }, select: { priority: true } });
  if (!before || before.priority === next) return;

  await prisma.task.update({ where: { id }, data: { priority: next } });
  await recordActivity({
    taskId: id, actorId: actor.uid, actorName: actor.name, kind: "priority",
    from: before.priority, to: next,
  });

  revalidateTask(projectId);
}

export async function updateTaskDueDateAction(id: string, projectId: string, dueDate: string) {
  const actor = await assertAccess("projects", "manage");
  const next = parseDueDate(dueDate);

  const before = await prisma.task.findUnique({
    where: { id },
    select: { dueDate: true, title: true, assigneeId: true },
  });
  if (!before) return;
  if (formatDue(before.dueDate) === formatDue(next)) return;

  await prisma.task.update({ where: { id }, data: { dueDate: next } });
  await recordActivity({
    taskId: id, actorId: actor.uid, actorName: actor.name, kind: "due",
    from: formatDue(before.dueDate), to: formatDue(next),
  });

  if (before.assigneeId && next) {
    await notifyUsers(
      [before.assigneeId],
      {
        kind: "due_soon",
        title: `“${before.title}” is now due ${formatDue(next)}`,
        url: taskUrl(projectId, id),
        taskId: id,
        actorName: actor.name,
      },
      actor.uid,
    );
  }

  revalidateTask(projectId);
  dispatchInBackground();
}

export async function updateTaskTitleAction(id: string, projectId: string, title: string) {
  const actor = await assertAccess("projects", "manage");
  const next = title?.trim();
  if (!next) return;

  const before = await prisma.task.findUnique({ where: { id }, select: { title: true } });
  if (!before || before.title === next) return;

  await prisma.task.update({ where: { id }, data: { title: next } });
  await recordActivity({
    taskId: id, actorId: actor.uid, actorName: actor.name, kind: "title",
    from: before.title, to: next,
  });

  revalidateTask(projectId);
}

export async function updateTaskDescriptionAction(id: string, projectId: string, description: string) {
  const actor = await assertAccess("projects", "manage");
  const next = (description ?? "").trim();

  const before = await prisma.task.findUnique({
    where: { id },
    select: { description: true, title: true, assigneeId: true },
  });
  if (!before || (before.description ?? "") === next) return;

  await prisma.task.update({ where: { id }, data: { description: next || null } });

  // Mentions added to a description notify exactly like mentions in a comment.
  if (next) {
    await notifyMentions(actor, next, {
      id, title: before.title, projectId, assigneeId: before.assigneeId,
    });
  }

  revalidateTask(projectId);
  dispatchInBackground();
}

export async function deleteTaskAction(id: string, projectId: string) {
  await assertAccess("projects", "manage");
  await prisma.task.delete({ where: { id } });
  revalidateTask(projectId);
}

// ── Subtasks ───────────────────────────────────────────────────────────────

export async function createSubTaskAction(taskId: string, projectId: string, formData: FormData) {
  const actor = await assertAccess("projects", "manage");
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  await prisma.subTask.create({ data: { title, taskId } });
  await recordActivity({
    taskId, actorId: actor.uid, actorName: actor.name, kind: "subtask", to: "added",
  });
  revalidateTask(projectId);
}

export async function toggleSubTaskAction(id: string, projectId: string, isCompleted: boolean) {
  const actor = await assertAccess("projects", "manage");
  const sub = await prisma.subTask.update({
    where: { id },
    data: { isCompleted },
    select: { taskId: true, title: true },
  });
  await recordActivity({
    taskId: sub.taskId, actorId: actor.uid, actorName: actor.name, kind: "subtask",
    field: sub.title, to: isCompleted ? "completed" : "reopened",
  });
  revalidateTask(projectId);
}

export async function updateSubTaskTitleAction(id: string, projectId: string, title: string) {
  await assertAccess("projects", "manage");
  const next = title?.trim();
  if (!next) return;
  await prisma.subTask.update({ where: { id }, data: { title: next } });
  revalidateTask(projectId);
}

export async function deleteSubTaskAction(id: string, projectId: string) {
  const actor = await assertAccess("projects", "manage");
  const sub = await prisma.subTask.delete({ where: { id }, select: { taskId: true } });
  await recordActivity({
    taskId: sub.taskId, actorId: actor.uid, actorName: actor.name, kind: "subtask", to: "removed",
  });
  revalidateTask(projectId);
}

// ── Comments ───────────────────────────────────────────────────────────────

/**
 * Post a comment.
 *
 * The author is taken from the verified session — the previous signature
 * accepted an author name from the browser, so any caller could post under
 * someone else's name.
 */
export async function addCommentAction(taskId: string, projectId: string, formData: FormData) {
  const actor = await assertAccess("projects", "manage");
  const content = (formData.get("content") as string)?.trim();
  if (!content) return;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true, assigneeId: true },
  });
  if (!task) return;

  const mentioned = await notifyMentions(
    actor,
    content,
    { id: taskId, title: task.title, projectId, assigneeId: task.assigneeId },
    { alsoOwner: true, kind: "comment", title: "commented on" },
  );

  await prisma.comment.create({
    data: {
      content,
      author: actor.name,
      authorId: actor.uid,
      // Persist the resolution so highlighting survives a later rename.
      mentions: mentioned.length ? JSON.stringify(mentioned) : null,
      taskId,
    },
  });

  await recordActivity({
    taskId, actorId: actor.uid, actorName: actor.name, kind: "comment",
  });

  revalidateTask(projectId);
  dispatchInBackground();
}

// ── Attachments ────────────────────────────────────────────────────────────

export async function addAttachmentAction(taskId: string, projectId: string, formData: FormData) {
  const actor = await assertAccess("projects", "manage");
  const name = (formData.get("name") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  if (!name || !url) return;

  // Only http(s): a javascript: or data: URL here would become a stored XSS
  // vector the moment someone clicks the link.
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
  } catch {
    return;
  }

  await prisma.attachment.create({ data: { name, url, taskId } });
  await recordActivity({
    taskId, actorId: actor.uid, actorName: actor.name, kind: "attachment", to: name,
  });
  revalidateTask(projectId);
}

export async function deleteAttachmentAction(id: string, projectId: string) {
  const actor = await assertAccess("projects", "manage");
  const att = await prisma.attachment.delete({ where: { id }, select: { taskId: true } });
  await recordActivity({
    taskId: att.taskId, actorId: actor.uid, actorName: actor.name, kind: "attachment", to: "removed",
  });
  revalidateTask(projectId);
}

// ── History ────────────────────────────────────────────────────────────────

/**
 * Activity for one task, fetched on demand when its detail panel opens.
 *
 * Deliberately not included in the project page query: a board with 30 tasks
 * would pull every task's full history on every render to display one panel.
 */
export async function taskActivityAction(taskId: string): Promise<ActivityRow[]> {
  await assertAccess("projects", "view");
  return taskActivity(taskId);
}

// ── Maintenance ────────────────────────────────────────────────────────────

/**
 * Link tasks written before IAM integration to real accounts, by matching the
 * stored display name. Idempotent — safe to run repeatedly.
 */
export async function backfillAssigneesAction(): Promise<{ linked: number; unmatched: string[] }> {
  await assertAccess("projects", "manage");

  const orphans = await prisma.task.findMany({
    where: { assigneeId: null, assignee: { not: UNASSIGNED } },
    select: { id: true, assignee: true },
  });

  let linked = 0;
  const unmatched = new Set<string>();
  for (const t of orphans) {
    const user = await resolveByName(t.assignee);
    if (!user) {
      unmatched.add(t.assignee);
      continue;
    }
    await prisma.task.update({
      where: { id: t.id },
      data: { assigneeId: user.id, assignee: user.name },
    });
    linked++;
  }

  revalidatePath("/admin/projects");
  return { linked, unmatched: [...unmatched] };
}

export async function seedProjectsAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAccess("projects", "manage");
  } catch {
    return { success: false, error: "Not authenticated. Please log in and try again." };
  }

  try {
    const { launchProjectData } = await import("@/data/seedProjects");

    const existing = await prisma.project.findFirst({ where: { title: launchProjectData.title } });
    const project = existing ?? await prisma.project.create({
      data: { title: launchProjectData.title, description: launchProjectData.description },
    });

    for (const taskData of launchProjectData.tasks) {
      let task = await prisma.task.findFirst({ where: { title: taskData.title, projectId: project.id } });
      if (!task) {
        // Seed data carries owner names; link them to real accounts where one exists.
        const owner = await resolveByName(taskData.assignee);
        task = await prisma.task.create({
          data: {
            title: taskData.title,
            status: taskData.status,
            assignee: owner?.name ?? taskData.assignee,
            assigneeId: owner?.id ?? null,
            projectId: project.id,
          },
        });
      }

      for (const subTitle of taskData.subTasks) {
        const exists = await prisma.subTask.findFirst({ where: { title: subTitle, taskId: task.id } });
        if (!exists) await prisma.subTask.create({ data: { title: subTitle, taskId: task.id } });
      }
    }

    revalidatePath("/admin/projects");
    return { success: true };
  } catch (e) {
    console.error("[seedProjectsAction] failed:", e);
    return { success: false, error: e instanceof Error ? e.message : "Seeding failed. Check server logs." };
  }
}
