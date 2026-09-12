import { randomUUID } from "node:crypto";
import { mysqlTable, text, timestamp, index, varchar, int, decimal, json, } from "drizzle-orm/mysql-core";
import { tenants, users } from "./tenancy.js";
import { clients } from "./clients.js";
export const meetingStatusEnum = [
    "scheduled",
    "awaiting_prereqs",
    /** Maya (the meeting bot) has been sent to the call and it is not over yet. */
    "live",
    "recorded",
    "transcribing",
    "analyzing",
    "analyzed",
    "failed",
];
export const transcriptionEngineEnum = [
    "whisper_local",
    "whisper_api",
    /** Live transcript streamed by the Vexa bot Maya rides in on. */
    "vexa",
];
/**
 * Pre-meeting prerequisite forms — global templates or client-specific.
 */
export const prerequisiteForms = mysqlTable("prerequisite_forms", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    /** null = global template applied to all clients */
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 191 }).notNull(),
    /** Field definitions: [{key,label,type,required,options}] */
    fields: json("fields").notNull().default([]),
    isActive: int("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("prereq_forms_tenant_idx").on(t.tenantId)]);
export const meetings = mysqlTable("meetings", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    agenda: text("agenda"),
    status: varchar("status", { length: 64 }).notNull().default("scheduled"),
    scheduledAt: timestamp("scheduled_at"),
    durationMinutes: int("duration_minutes"),
    attendees: json("attendees").notNull().default([]),
    /** Prerequisite form responses captured before the meeting */
    prerequisiteFormId: varchar("prerequisite_form_id", { length: 36 }).references(() => prerequisiteForms.id, { onDelete: "set null" }),
    prerequisiteResponses: json("prerequisite_responses").notNull().default({}),
    /** Object-storage key of the uploaded recording */
    recordingStorageKey: text("recording_storage_key"),
    recordingMimeType: text("recording_mime_type"),
    organizerId: varchar("organizer_id", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    /** AI-extracted output: requirements, challenges, action items */
    extractedRequirements: json("extracted_requirements").notNull().default([]),
    extractedChallenges: json("extracted_challenges").notNull().default([]),
    actionItems: json("action_items").notNull().default([]),
    /** Generated Expectation Baseline document (markdown) */
    expectationBaseline: text("expectation_baseline"),
    analysisConfidence: decimal("analysis_confidence", { precision: 5, scale: 2 }),
    // ── Maya, the meeting agent (2026-09-12) ──────────────────────────────
    /** The join link the team pasted; used only to derive the bot's address. */
    meetingUrl: text("meeting_url"),
    /** Vexa address of the bot session: platform + native meeting id. */
    botPlatform: varchar("bot_platform", { length: 32 }),
    botMeetingId: varchar("bot_meeting_id", { length: 191 }),
    /** Last status Vexa reported (requested → awaiting_admission → active → completed/failed). */
    botStatus: varchar("bot_status", { length: 64 }),
    botRequestedAt: timestamp("bot_requested_at"),
    botEndedAt: timestamp("bot_ended_at"),
    /** What the team told Maya during the call: [{at, speaker, kind, text}] */
    liveNotes: json("live_notes").notNull().default([]),
    /** Minutes of meeting (markdown) and a short summary, written after the call. */
    minutesMarkdown: text("minutes_markdown"),
    summary: text("summary"),
    /** Documents promised or requested in the call: [{type,title,audience,brief,status,documentId}] */
    mentionedDocuments: json("mentioned_documents").notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
    index("meetings_tenant_idx").on(t.tenantId),
    index("meetings_client_idx").on(t.clientId),
    index("meetings_bot_idx").on(t.botPlatform, t.botMeetingId),
]);
export const transcripts = mysqlTable("transcripts", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    meetingId: varchar("meeting_id", { length: 36 })
        .notNull()
        .references(() => meetings.id, { onDelete: "cascade" }),
    engine: varchar("engine", { length: 64 }).notNull(),
    language: varchar("language", { length: 191 }),
    fullText: text("full_text").notNull(),
    /** Timestamped segments: [{start, end, speaker, text}] */
    segments: json("segments").notNull().default([]),
    wordCount: int("word_count"),
    processingTimeMs: int("processing_time_ms"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("transcripts_meeting_idx").on(t.meetingId)]);
export const sowStatusEnum = [
    "draft",
    "internal_review",
    "sent",
    "approved",
    "rejected",
];
/**
 * Automated SOW Generator output — parsed from meeting intelligence.
 */
export const sowDocuments = mysqlTable("sow_documents", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    meetingId: varchar("meeting_id", { length: 36 }).references(() => meetings.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    /** Full structured SOW: scope items, deliverables, exclusions */
    scopeItems: json("scope_items").notNull().default([]),
    technicalFeasibility: json("technical_feasibility").notNull().default({}),
    /** Man-day estimates per scope item with totals */
    manDayEstimates: json("man_day_estimates").notNull().default({}),
    /** Good / Better / Best option tiers with pricing deltas */
    optionTiers: json("option_tiers").notNull().default([]),
    documentMarkdown: text("document_markdown"),
    generationConfidence: decimal("generation_confidence", { precision: 5, scale: 2 }),
    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("sow_client_idx").on(t.clientId)]);
//# sourceMappingURL=meetings.js.map