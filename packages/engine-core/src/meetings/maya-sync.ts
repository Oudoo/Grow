import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { db, meetings, transcripts } from "@growengine/db";
import { env } from "../env.js";
import { publishEvent, EVENT_TYPES } from "../events.js";
import { createTrackedAiJob } from "../jobs.js";
import {
  extractMayaCommands,
  fetchVexaTranscript,
  isMayaConfigured,
  jsonArrayFrom,
  normalizeVexaSegments,
  type MeetingPlatform,
  type TranscriptSegment,
} from "./vexa.js";

/**
 * Keep a meeting Maya is in synchronised with Vexa: pull the transcript so
 * far, refresh the live notes, mirror the bot status, and when the call ends
 * hand the meeting to the existing analysis pipeline.
 *
 * Called two ways, on purpose: the worker's scheduler polls every live
 * meeting every 20 s (so the meeting page shows notes while the call is on),
 * and Vexa's webhook calls it the moment a meeting completes (so minutes do
 * not wait for the next tick). Both paths are idempotent; the hand-off to
 * analysis happens once, guarded by botEndedAt.
 */

type MeetingRow = typeof meetings.$inferSelect;

export async function pollMayaMeetings(): Promise<number> {
  if (!isMayaConfigured()) return 0;
  const live = await db
    .select()
    .from(meetings)
    .where(and(isNotNull(meetings.botMeetingId), isNull(meetings.botEndedAt)));
  let synced = 0;
  for (const meeting of live) {
    try {
      await syncMayaMeeting(meeting);
      synced++;
    } catch (err) {
      console.error(`[maya] sync of meeting ${meeting.id} failed: ${(err as Error).message}`);
    }
  }
  return synced;
}

export async function syncMayaMeetingById(meetingId: string): Promise<void> {
  const [meeting] = await db.select().from(meetings).where(eq(meetings.id, meetingId));
  if (meeting) await syncMayaMeeting(meeting);
}

export async function findMeetingByBot(platform: string, nativeMeetingId: string): Promise<MeetingRow | undefined> {
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.botPlatform, platform), eq(meetings.botMeetingId, nativeMeetingId)))
    .orderBy(meetings.createdAt)
    .limit(1);
  return meeting;
}

export async function syncMayaMeeting(meeting: MeetingRow): Promise<void> {
  if (!meeting.botPlatform || !meeting.botMeetingId) return;
  const remote = await fetchVexaTranscript(meeting.botPlatform as MeetingPlatform, meeting.botMeetingId);
  const segments = normalizeVexaSegments(remote.segments);
  const status = remote.status ?? meeting.botStatus ?? "requested";

  if (segments.length > 0) await upsertTranscript(meeting, segments, remote);

  const liveNotes = extractMayaCommands(segments, env.mayaBotName);
  const patch: Partial<typeof meetings.$inferInsert> = {
    botStatus: status,
    liveNotes,
    updatedAt: new Date(),
  };

  if (status === "active" && meeting.botStatus !== "active") {
    await publishEvent({
      tenantId: meeting.tenantId,
      eventType: EVENT_TYPES.mayaJoined,
      entityType: "meeting",
      entityId: meeting.id,
      payload: { clientId: meeting.clientId },
    });
  }

  const ended = status === "completed" || status === "failed";
  if (ended && !meeting.botEndedAt) {
    // The hand-off must happen exactly once, and several app copies poll the
    // same meeting (plus the webhook). So the transition is a conditional
    // UPDATE — `where bot_ended_at is null` — and only the caller whose
    // update changed a row queues the analysis. A read-then-write here let
    // two copies both see "not ended yet".
    const endedAt = new Date();
    const nextStatus = segments.length > 0 ? "recorded" : "scheduled";
    const result = await db
      .update(meetings)
      .set({ ...patch, botEndedAt: endedAt, status: nextStatus })
      .where(and(eq(meetings.id, meeting.id), isNull(meetings.botEndedAt)));
    const changed = (result as unknown as [{ affectedRows?: number }])[0]?.affectedRows ?? 0;
    if (changed === 0) return; // another copy already handed it off

    if (segments.length > 0) {
      // Same hand-off an uploaded recording gets: the analysis job finds the
      // transcript row already there and skips transcription.
      await createTrackedAiJob(meeting.tenantId, meeting.clientId, "meeting_analysis", { meetingId: meeting.id });
    }
    // Otherwise Maya never got in (not admitted, wrong link…): status is back
    // to scheduled so the team can send her again; the reason stays in botStatus.
    await publishEvent({
      tenantId: meeting.tenantId,
      eventType: EVENT_TYPES.mayaLeft,
      entityType: "meeting",
      entityId: meeting.id,
      payload: { clientId: meeting.clientId, status, segments: segments.length },
    });
    return;
  }

  await db.update(meetings).set(patch).where(eq(meetings.id, meeting.id));
}

async function upsertTranscript(
  meeting: MeetingRow,
  segments: TranscriptSegment[],
  remote: { start_time?: string | null }
) {
  const fullText = segments
    .filter((s) => !s.interim)
    .map((s) => (s.speaker ? `${s.speaker}: ${s.text}` : s.text))
    .join("\n");
  const language = (remote as { segments?: { language?: string | null }[] }).segments?.find((s) => s.language)?.language ?? null;
  const [existing] = await db.select().from(transcripts).where(eq(transcripts.meetingId, meeting.id));
  const values = {
    engine: "vexa",
    language,
    fullText,
    segments,
    wordCount: fullText.split(/\s+/).filter(Boolean).length,
  };
  if (existing) {
    await db.update(transcripts).set(values).where(eq(transcripts.id, existing.id));
  } else {
    await db.insert(transcripts).values({ ...values, tenantId: meeting.tenantId, meetingId: meeting.id });
  }
}

/** Read the live notes column without tripping on MariaDB's string-typed JSON. */
export function readLiveNotes(meeting: Pick<MeetingRow, "liveNotes">) {
  return jsonArrayFrom<{ at: number; speaker: string | null; kind: string; text: string }>(meeting.liveNotes);
}
