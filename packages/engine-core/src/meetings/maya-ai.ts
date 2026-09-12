import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db, meetings, transcripts, clients, knowledgeDocuments } from "@growengine/db";
import { aiComplete, aiCompleteStructured, type AiCallContext } from "../ai/provider.js";
import { indexEntity, linkEntities } from "../aom.js";
import { publishEvent, EVENT_TYPES } from "../events.js";
import { createTrackedAiJob } from "../jobs.js";
import { env } from "../env.js";
import { jsonArrayFrom, type MayaLiveNote } from "./vexa.js";

/**
 * Maya's writing: the minutes, the summary, and the documents a meeting asked
 * for. Runs in the AI worker after the existing requirements/baseline
 * analysis, on the same transcript, with whatever the team dictated to Maya
 * during the call given the highest priority. Everything lands in the
 * knowledge base for a person to review; nothing here sends anything anywhere.
 */

const MAYA_SYSTEM =
  "You are Maya, GROW's meeting agent. GROW is a growth consultancy whose clients are businesses " +
  "(clinics, gyms, pharmacies, retailers). You write for busy professionals: precise, concrete, and " +
  "grounded strictly in the transcript and in the notes the team dictated to you. Never invent names, " +
  "numbers, dates or commitments; when something was not established, say so or leave a [placeholder]. " +
  "Meetings are held in Arabic, English, or both — write in the language the meeting was mostly held in, " +
  "and keep proper nouns as they were spoken.";

export const MeetingMinutesSchema = z.object({
  summary: z.string().describe("Three to six sentences a busy executive can read in thirty seconds."),
  minutesMarkdown: z
    .string()
    .describe(
      "Complete minutes of meeting in markdown with these sections: Attendees; Agenda; Discussion (one " +
        "subsection per topic); Decisions; Action items (owner and due date when stated); Documents to " +
        "prepare; Next steps; Open questions."
    ),
  decisions: z.array(
    z.object({
      text: z.string(),
      evidenceQuote: z.string().describe("A short verbatim quote from the transcript."),
    })
  ),
  documents: z
    .array(
      z.object({
        type: z.enum(["proposal", "sow", "report", "brief", "presentation", "quotation", "contract", "email", "other"]),
        title: z.string(),
        audience: z.enum(["client", "internal"]).describe("client if it will be sent to the client."),
        brief: z.string().describe("What the document must contain, two to five sentences, from the transcript only."),
        requestedBy: z.string().describe("Who asked for it, or an empty string if unclear."),
        evidenceQuote: z.string(),
      })
    )
    .describe("Every document, proposal, quotation, report, brief, deck or email that someone promised or asked for."),
});

export type MeetingMinutes = z.infer<typeof MeetingMinutesSchema>;

export type MentionedDocument = MeetingMinutes["documents"][number] & {
  status: "requested" | "drafted" | "failed";
  documentId?: string;
  draftedAt?: string;
  error?: string;
};

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

async function loadMeeting(meetingId: string, tenantId: string) {
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.tenantId, tenantId)));
  if (!meeting) throw new Error(`Meeting ${meetingId} not found`);
  const [client] = await db.select().from(clients).where(eq(clients.id, meeting.clientId));
  return { meeting, client };
}

/**
 * Write the minutes + summary, record the documents mentioned, file the
 * minutes into the AOM, and queue the drafting job. Returns null when there is
 * no transcript to work from.
 */
export async function composeMeetingMinutes(meetingId: string, tenantId: string): Promise<MeetingMinutes | null> {
  const { meeting, client } = await loadMeeting(meetingId, tenantId);
  const [transcript] = await db.select().from(transcripts).where(eq(transcripts.meetingId, meetingId));
  if (!transcript || !transcript.fullText.trim()) return null;

  const ctx: AiCallContext = { tenantId, clientId: meeting.clientId, feature: "meeting_minutes" };
  const liveNotes = jsonArrayFrom<MayaLiveNote>(meeting.liveNotes);
  const dictated =
    liveNotes.length > 0
      ? liveNotes.map((n) => `- [${n.kind}] ${n.speaker ?? "someone"} at ${mmss(n.at)}: ${n.text}`).join("\n")
      : "(nothing was said to Maya directly)";
  const prereqs = JSON.stringify(meeting.prerequisiteResponses ?? {});
  const when = meeting.scheduledAt ? meeting.scheduledAt.toISOString().slice(0, 10) : "date not set";

  const minutes = await aiCompleteStructured(
    MeetingMinutesSchema,
    `MEETING: ${meeting.title} — client: ${client?.name ?? "unknown"}${client?.industry ? ` (${client.industry})` : ""} — ${when}
AGENDA: ${meeting.agenda ?? "(none recorded)"}
PRE-MEETING FORM RESPONSES: ${prereqs}

WHAT THE TEAM SAID TO ${env.mayaBotName.toUpperCase()} DURING THE CALL — highest priority. Every one of these must appear in the minutes; the ones asking for a document must appear in "documents":
${dictated}

TRANSCRIPT (speaker-attributed, ${transcript.wordCount ?? "?"} words):
${transcript.fullText.slice(0, 120_000)}

Write the summary, the full minutes, the decisions with evidence, and the list of documents that were promised or requested.`,
    ctx,
    { system: MAYA_SYSTEM, maxTokens: 16000 }
  );

  const mentioned: MentionedDocument[] = minutes.documents.map((d) => ({ ...d, status: "requested" }));
  await db
    .update(meetings)
    .set({
      summary: minutes.summary,
      minutesMarkdown: minutes.minutesMarkdown,
      mentionedDocuments: mentioned,
      updatedAt: new Date(),
    })
    .where(eq(meetings.id, meetingId));

  const docId = randomUUID();
  await db.insert(knowledgeDocuments).values({
    id: docId,
    tenantId,
    clientId: meeting.clientId,
    type: "meeting_minutes",
    title: `Minutes — ${meeting.title}`,
    contentMarkdown: minutes.minutesMarkdown,
    sourceEntityType: "meeting",
    sourceEntityId: meetingId,
    tags: ["maya", "minutes"],
  });
  await linkEntities({
    tenantId,
    fromEntityType: "knowledge_document",
    fromEntityId: docId,
    toEntityType: "meeting",
    toEntityId: meetingId,
    linkType: "generated_from",
  });
  try {
    await indexEntity(
      { tenantId, clientId: meeting.clientId, entityType: "knowledge_document", entityId: docId, text: minutes.minutesMarkdown },
      ctx
    );
  } catch {
    /* embedding provider unavailable — the minutes are still filed */
  }

  await publishEvent({
    tenantId,
    eventType: EVENT_TYPES.meetingMinutesReady,
    entityType: "meeting",
    entityId: meetingId,
    payload: { clientId: meeting.clientId, documents: mentioned.length, decisions: minutes.decisions.length },
  });
  if (mentioned.length > 0) {
    await createTrackedAiJob(tenantId, meeting.clientId, "meeting_documents", { meetingId });
  }
  return minutes;
}

/**
 * Draft every document still marked "requested". One AI call per document,
 * progress written back after each so the meeting page can show it, failures
 * recorded on the item rather than failing the whole job.
 */
export async function draftMeetingDocuments(meetingId: string, tenantId: string) {
  const { meeting, client } = await loadMeeting(meetingId, tenantId);
  const docs = jsonArrayFrom<MentionedDocument>(meeting.mentionedDocuments);
  const pending = docs.map((doc, index) => ({ doc, index })).filter(({ doc }) => doc.status === "requested");
  if (pending.length === 0) return { drafted: 0, failed: 0 };

  const requirements = jsonArrayFrom<{ text: string; priority: string }>(meeting.extractedRequirements);
  const challenges = jsonArrayFrom<{ text: string; severity: string }>(meeting.extractedChallenges);
  const ctx: AiCallContext = { tenantId, clientId: meeting.clientId, feature: "meeting_document_draft" };
  let drafted = 0;

  for (const { doc, index } of pending) {
    try {
      const markdown = await aiComplete(
        `Draft the following document for GROW, ready for a person to review before it goes anywhere. Markdown, starting with a title line. Use [brackets] for anything the meeting did not establish (prices, dates, names). Write in the language the meeting was mostly held in.

DOCUMENT TYPE: ${doc.type}
TITLE: ${doc.title}
AUDIENCE: ${doc.audience === "client" ? `the client (${client?.name ?? "unknown"})` : "GROW's internal team"}
WHAT IT MUST CONTAIN: ${doc.brief}
REQUESTED BY: ${doc.requestedBy || "not stated"}

CLIENT: ${client?.name ?? "unknown"}${client?.industry ? ` — ${client.industry}` : ""}${client?.websiteUrl ? ` — ${client.websiteUrl}` : ""}
MEETING: ${meeting.title}${meeting.scheduledAt ? ` on ${meeting.scheduledAt.toISOString().slice(0, 10)}` : ""}
SUMMARY: ${meeting.summary ?? "(none)"}
REQUIREMENTS HEARD: ${requirements.map((r) => `${r.priority}: ${r.text}`).join("; ") || "(none extracted)"}
CHALLENGES HEARD: ${challenges.map((c) => `${c.severity}: ${c.text}`).join("; ") || "(none extracted)"}

MINUTES:
${(meeting.minutesMarkdown ?? "").slice(0, 20_000)}`,
        ctx,
        { system: MAYA_SYSTEM, maxTokens: 16000 }
      );
      if (!markdown.trim()) throw new Error("empty draft");

      const id = randomUUID();
      await db.insert(knowledgeDocuments).values({
        id,
        tenantId,
        clientId: meeting.clientId,
        type: "maya_draft",
        title: doc.title,
        contentMarkdown: markdown,
        sourceEntityType: "meeting",
        sourceEntityId: meetingId,
        tags: ["maya", "draft", doc.type, doc.audience],
      });
      await linkEntities({
        tenantId,
        fromEntityType: "knowledge_document",
        fromEntityId: id,
        toEntityType: "meeting",
        toEntityId: meetingId,
        linkType: "generated_from",
      });
      try {
        await indexEntity({ tenantId, clientId: meeting.clientId, entityType: "knowledge_document", entityId: id, text: markdown }, ctx);
      } catch {
        /* embedding provider unavailable */
      }
      docs[index] = { ...doc, status: "drafted", documentId: id, draftedAt: new Date().toISOString() };
      drafted++;
      await publishEvent({
        tenantId,
        eventType: EVENT_TYPES.documentDrafted,
        entityType: "knowledge_document",
        entityId: id,
        payload: { meetingId, clientId: meeting.clientId, type: doc.type, audience: doc.audience },
      });
    } catch (err) {
      docs[index] = { ...doc, status: "failed", error: (err as Error).message.slice(0, 300) };
    }
    await db.update(meetings).set({ mentionedDocuments: docs, updatedAt: new Date() }).where(eq(meetings.id, meetingId));
  }
  return { drafted, failed: pending.length - drafted };
}
