import "server-only";
import { prisma } from "./db";

/**
 * Task audit trail.
 *
 * Every mutation in the project board records what changed, who changed it and
 * when. Like notifications, this is best-effort: losing an audit row must never
 * roll back the change it describes, so every write here is wrapped and logged
 * rather than thrown.
 */

export type ActivityKind =
  | "created"
  | "status"
  | "assignee"
  | "priority"
  | "due"
  | "title"
  | "comment"
  | "subtask"
  | "attachment";

export interface ActivityInput {
  taskId: string;
  actorId?: string | null;
  actorName?: string | null;
  kind: ActivityKind;
  field?: string;
  from?: string | null;
  to?: string | null;
}

export async function recordActivity(input: ActivityInput): Promise<void> {
  try {
    await prisma.activity.create({
      data: {
        taskId: input.taskId,
        actorId: input.actorId ?? null,
        actorName: input.actorName?.trim() || "System",
        kind: input.kind,
        field: input.field ?? null,
        fromValue: input.from ?? null,
        toValue: input.to ?? null,
      },
    });
  } catch (e) {
    console.error("[activity] could not record event:", e);
  }
}

export type { ActivityRow } from "./activity-format";
export { describeActivity } from "./activity-format";

export async function taskActivity(taskId: string, take = 40): Promise<import("./activity-format").ActivityRow[]> {
  try {
    return await prisma.activity.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true, actorName: true, kind: true,
        field: true, fromValue: true, toValue: true, createdAt: true,
      },
    });
  } catch (e) {
    console.error("[activity] listing failed:", e);
    return [];
  }
}
