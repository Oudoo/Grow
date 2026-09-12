"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, meetings, clients, sowDocuments, prerequisiteForms } from "@growengine/db";
import {
  audit,
  publishEvent,
  EVENT_TYPES,
  uploadObject,
  isMayaConfigured,
  parseMeetingLink,
  sendMayaToMeeting,
  stopMayaBot,
  syncMayaMeetingById,
} from "@growengine/core";
import { requirePermission } from "@/lib/engine/session";
import { createAiJob } from "@/lib/engine/jobs";
import { assertAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listDirectory, resolveByName, UNASSIGNED, type DirectoryUser } from "@/lib/directory";
import { dispatchInBackground, notifyUsers } from "@/lib/notify";
import { recordActivity } from "@/lib/activity";
import { getProjectConfig } from "@/lib/settings";
import { jsonArray } from "@/lib/engine/json";

const meetingSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(2).max(200),
  agenda: z.string().max(5000).optional(),
  scheduledAt: z.string().optional(),
  meetingUrl: z.string().max(2000).optional(),
});

export async function createMeeting(formData: FormData) {
  const user = await requirePermission("meetings:manage");
  const parsed = meetingSchema.safeParse({
    clientId: formData.get("clientId"),
    title: formData.get("title"),
    agenda: formData.get("agenda") || undefined,
    scheduledAt: formData.get("scheduledAt") || undefined,
    meetingUrl: formData.get("meetingUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, parsed.data.clientId), eq(clients.tenantId, user.tenantId)));
  if (!client) return { error: "Client not found" };

  // Attach the most specific active prerequisite form (client > global)
  const forms = await db
    .select()
    .from(prerequisiteForms)
    .where(and(eq(prerequisiteForms.tenantId, user.tenantId), eq(prerequisiteForms.isActive, 1)));
  const form =
    forms.find((f) => f.clientId === client.id) ?? forms.find((f) => f.clientId === null);

  const __meetingId = crypto.randomUUID();
  await db
    .insert(meetings)
    .values({
        id: __meetingId,
      tenantId: user.tenantId,
      clientId: client.id,
      title: parsed.data.title,
      agenda: parsed.data.agenda,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      meetingUrl: parsed.data.meetingUrl?.trim() || null,
      organizerId: user.id,
      prerequisiteFormId: form?.id ?? null,
      status: form ? "awaiting_prereqs" : "scheduled",
    })
    ;
  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, __meetingId));

  await audit({
    tenantId: user.tenantId,
    actorId: user.id,
    action: "meeting.create",
    entityType: "meeting",
    entityId: meeting.id,
  });
  revalidatePath("/engine/meetings");
  return { ok: true, meetingId: meeting.id };
}

export async function savePrerequisiteResponses(meetingId: string, formData: FormData) {
  const user = await requirePermission("meetings:manage");
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };

  const responses: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field_")) responses[key.slice(6)] = String(value);
  }
  await db
    .update(meetings)
    .set({ prerequisiteResponses: responses, status: "scheduled", updatedAt: new Date() })
    .where(eq(meetings.id, meetingId));
  revalidatePath(`/engine/meetings/${meetingId}`);
  return { ok: true };
}

/** Upload a meeting recording to object storage and queue analysis. */
export async function uploadRecording(meetingId: string, formData: FormData) {
  const user = await requirePermission("meetings:manage");
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };

  const file = formData.get("recording") as File | null;
  if (!file || file.size === 0) return { error: "No recording file provided" };
  if (file.size > 500 * 1024 * 1024) return { error: "Recording exceeds 500MB limit" };

  const ext = file.name.split(".").pop() ?? "mp3";
  const key = `${user.tenantId}/meetings/${meetingId}/recording.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await uploadObject(key, buffer, file.type || "audio/mpeg");

  await db
    .update(meetings)
    .set({
      recordingStorageKey: key,
      recordingMimeType: file.type,
      status: "recorded",
      updatedAt: new Date(),
    })
    .where(eq(meetings.id, meetingId));

  await publishEvent({
    tenantId: user.tenantId,
    eventType: EVENT_TYPES.meetingRecorded,
    entityType: "meeting",
    entityId: meetingId,
    payload: { clientId: meeting.clientId },
  });

  // Queue the full pipeline: transcribe → extract → baseline
  await createAiJob(user.tenantId, meeting.clientId, "meeting_analysis", { meetingId });

  revalidatePath(`/engine/meetings/${meetingId}`);
  return { ok: true };
}

export async function reanalyzeMeeting(meetingId: string) {
  const user = await requirePermission("meetings:manage");
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };
  await createAiJob(user.tenantId, meeting.clientId, "meeting_analysis", { meetingId });
  revalidatePath(`/engine/meetings/${meetingId}`);
  return { ok: true };
}

/** Generate an SOW from an analyzed meeting. */
export async function generateSow(meetingId: string) {
  const user = await requirePermission("meetings:manage");
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };
  if (meeting.status !== "analyzed") return { error: "Meeting must be analyzed first" };

  const __sowId = crypto.randomUUID();
  await db
    .insert(sowDocuments)
    .values({
        id: __sowId,
      tenantId: user.tenantId,
      clientId: meeting.clientId,
      meetingId,
      title: `SOW — ${meeting.title}`,
      createdBy: user.id,
    })
    ;
  const [sow] = await db.select().from(sowDocuments).where(eq(sowDocuments.id, __sowId));

  await createAiJob(user.tenantId, meeting.clientId, "sow", { meetingId, sowId: sow.id });
  revalidatePath(`/engine/meetings/${meetingId}`);
  return { ok: true, sowId: sow.id };
}

const prereqFormSchema = z.object({
  name: z.string().min(2).max(120),
  clientId: z.string().uuid().optional().or(z.literal("")),
  fieldsJson: z.string(),
});

export async function createPrerequisiteForm(formData: FormData) {
  const user = await requirePermission("meetings:manage");
  const parsed = prereqFormSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId") || "",
    fieldsJson: formData.get("fieldsJson"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  let fields: unknown[];
  try {
    fields = JSON.parse(parsed.data.fieldsJson);
    if (!Array.isArray(fields)) throw new Error();
  } catch {
    return { error: "Fields must be a JSON array of {key,label,type,required}" };
  }

  await db.insert(prerequisiteForms).values({
    tenantId: user.tenantId,
    clientId: parsed.data.clientId || null,
    name: parsed.data.name,
    fields,
  });
  revalidatePath("/engine/meetings");
  return { ok: true };
}


// ── Maya, the meeting agent ────────────────────────────────────────────────

/**
 * Send Maya into the call. The link (or the Teams "Meeting ID + passcode"
 * from the invite) is parsed into a Vexa address; Vexa sends a participant
 * named Maya, who knocks and must be admitted by someone in the meeting.
 */
export async function inviteMaya(meetingId: string, formData: FormData) {
  const user = await requirePermission("meetings:manage");
  if (!isMayaConfigured()) {
    return { error: "Maya is not configured yet — VEXA_API_KEY is missing from .grow.env (see DEPLOYMENT.md, \"Maya\")." };
  }
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };
  if (meeting.botMeetingId && !meeting.botEndedAt) {
    return { error: "Maya is already in, or on her way to, this meeting." };
  }

  const raw = String(formData.get("meetingLink") ?? meeting.meetingUrl ?? "").trim();
  const passcode = String(formData.get("passcode") ?? "").trim();
  const link = parseMeetingLink(raw);
  if (!link) {
    return {
      error:
        "Paste a Google Meet link (meet.google.com/xxx-xxxx-xxx), a Teams teams.live.com/meet/… link, " +
        "or the Meeting ID from the Teams invite with its passcode in the second field.",
    };
  }
  if (passcode && !link.passcode) link.passcode = passcode;

  try {
    await sendMayaToMeeting(link);
  } catch (err) {
    return { error: `Vexa did not accept the request: ${(err as Error).message}` };
  }

  await db
    .update(meetings)
    .set({
      meetingUrl: raw.slice(0, 2000),
      botPlatform: link.platform,
      botMeetingId: link.nativeMeetingId,
      botStatus: "requested",
      botRequestedAt: new Date(),
      botEndedAt: null,
      status: "live",
      updatedAt: new Date(),
    })
    .where(eq(meetings.id, meetingId));

  await audit({
    tenantId: user.tenantId,
    actorId: user.id,
    action: "meeting.maya_invited",
    entityType: "meeting",
    entityId: meetingId,
    changes: { platform: link.platform },
  });
  revalidatePath(`/engine/meetings/${meetingId}`);
  revalidatePath("/engine/meetings");
  return { ok: true };
}

/** Ask Maya to leave. Vexa finalises the transcript; the next sync hands it to analysis. */
export async function dismissMaya(meetingId: string) {
  const user = await requirePermission("meetings:manage");
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };
  if (!meeting.botPlatform || !meeting.botMeetingId || meeting.botEndedAt) {
    return { error: "Maya is not in this meeting." };
  }
  try {
    await stopMayaBot(meeting.botPlatform as "google_meet" | "teams", meeting.botMeetingId);
  } catch (err) {
    return { error: `Vexa could not stop the bot: ${(err as Error).message}` };
  }
  await db.update(meetings).set({ botStatus: "stopping", updatedAt: new Date() }).where(eq(meetings.id, meetingId));
  revalidatePath(`/engine/meetings/${meetingId}`);
  return { ok: true };
}

/** Pull the transcript and notes right now instead of waiting for the next poll. */
export async function refreshMaya(meetingId: string) {
  const user = await requirePermission("meetings:read");
  const [meeting] = await db
    .select({ id: meetings.id })
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };
  try {
    await syncMayaMeetingById(meetingId);
  } catch (err) {
    return { error: (err as Error).message };
  }
  revalidatePath(`/engine/meetings/${meetingId}`);
  return { ok: true };
}

export interface MeetingActionItem {
  text: string;
  owner: string;
  due: string | null;
  /** Set once a person approved it into the project board. */
  taskId?: string;
}

/**
 * Owners come out of a transcript as people say them — "Seif", "Dr. Hana",
 * an email. Exact name/email first (the directory's own rule), then a unique
 * first-name match; anything ambiguous stays Unassigned rather than guessing.
 */
async function resolveOwner(owner: string | null | undefined): Promise<DirectoryUser | null> {
  if (!owner) return null;
  const exact = await resolveByName(owner);
  if (exact) return exact;
  const first = owner.trim().toLowerCase().replace(/^(dr|mr|ms|mrs|eng)\.?\s+/i, "").split(/\s+/)[0];
  if (!first || first.length < 3) return null;
  const all = await listDirectory();
  const matches = all.filter((u) => u.name.trim().toLowerCase().split(/\s+/)[0] === first);
  return matches.length === 1 ? matches[0] : null;
}

function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * The approval step. Maya only PROPOSES action items; a person with
 * projects:manage picks which become tasks and in which project. Each task is
 * created through the same path the board uses (activity row, assignee
 * notification), so it is indistinguishable from a hand-made one except for
 * the description saying where it came from.
 */
export async function createTasksFromMeeting(meetingId: string, formData: FormData) {
  const user = await requirePermission("meetings:manage");
  let actor;
  try {
    actor = await assertAccess("projects", "manage");
  } catch {
    return { error: "You need 'manage' access to Projects to create tasks." };
  }
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, user.tenantId)));
  if (!meeting) return { error: "Meeting not found" };

  const projectId = String(formData.get("projectId") ?? "");
  const project = projectId ? await prisma.project.findUnique({ where: { id: projectId } }) : null;
  if (!project) return { error: "Choose the project these tasks belong to." };

  const picked = formData
    .getAll("items")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 0);
  if (picked.length === 0) return { error: "Tick at least one action item." };

  const items = jsonArray<MeetingActionItem>(meeting.actionItems);
  const { priorities } = await getProjectConfig();
  const priority = priorities[Math.floor(priorities.length / 2)]?.id ?? "MEDIUM";
  const when = meeting.scheduledAt ? ` on ${meeting.scheduledAt.toISOString().slice(0, 10)}` : "";

  let created = 0;
  for (const index of picked) {
    const item = items[index];
    if (!item || item.taskId) continue;
    const owner = await resolveOwner(item.owner);
    const task = await prisma.task.create({
      data: {
        title: item.text.trim().slice(0, 180),
        description:
          `From the meeting "${meeting.title}"${when}. Proposed by Maya, approved by ${actor.name}.` +
          (item.owner ? `\n\nOwner as said in the meeting: ${item.owner}.` : ""),
        assignee: owner?.name ?? UNASSIGNED,
        assigneeId: owner?.id ?? null,
        priority,
        dueDate: parseIsoDate(item.due),
        projectId: project.id,
      },
    });
    await recordActivity({
      taskId: task.id,
      actorId: actor.uid,
      actorName: `${actor.name} (via Maya)`,
      kind: "created",
      to: task.title,
    });
    if (owner) {
      await notifyUsers(
        [owner.id],
        {
          kind: "assigned",
          title: `Maya: ${task.title}`,
          body: `Action item from "${meeting.title}", approved by ${actor.name}.`,
          url: `/admin/projects/${project.id}?task=${task.id}`,
          taskId: task.id,
          actorName: "Maya",
        },
        actor.uid,
      );
    }
    items[index] = { ...item, taskId: task.id };
    created++;
  }

  await db.update(meetings).set({ actionItems: items, updatedAt: new Date() }).where(eq(meetings.id, meetingId));
  await audit({
    tenantId: user.tenantId,
    actorId: user.id,
    action: "meeting.tasks_created",
    entityType: "meeting",
    entityId: meetingId,
    changes: { projectId: project.id, created },
  });
  revalidatePath(`/admin/projects/${project.id}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/my-work");
  revalidatePath(`/engine/meetings/${meetingId}`);
  dispatchInBackground();
  return { ok: true, created };
}
