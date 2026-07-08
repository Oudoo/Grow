import { randomUUID } from "node:crypto";
import { mysqlTable, text, timestamp, index, uniqueIndex, varchar, int, json, } from "drizzle-orm/mysql-core";
import { tenants, users } from "./tenancy.js";
import { clients } from "./clients.js";
/**
 * Enterprise Audit Trail — immutable record of every significant action.
 */
export const auditLogs = mysqlTable("audit_logs", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    actorId: varchar("actor_id", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    actorType: varchar("actor_type", { length: 191 }).notNull().default("user"),
    action: varchar("action", { length: 191 }).notNull(),
    entityType: varchar("entity_type", { length: 191 }),
    entityId: varchar("entity_id", { length: 36 }),
    /** Before/after snapshot for changes */
    changes: json("changes").notNull().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
    index("audit_logs_tenant_idx").on(t.tenantId, t.createdAt),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
]);
export const notificationChannelEnum = [
    "in_app",
    "email",
    "slack",
    "teams",
    "webhook",
];
export const notifications = mysqlTable("notifications", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "cascade" }),
    channel: varchar("channel", { length: 64 }).notNull().default("in_app"),
    /** Template key that produced this notification */
    templateKey: varchar("template_key", { length: 191 }),
    title: text("title").notNull(),
    body: text("body"),
    linkUrl: text("link_url"),
    /** queued | sent | delivered | failed | read */
    status: varchar("status", { length: 191 }).notNull().default("queued"),
    error: text("error"),
    metadata: json("metadata").notNull().default({}),
    readAt: timestamp("read_at"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
    index("notifications_user_idx").on(t.userId, t.status),
    index("notifications_tenant_idx").on(t.tenantId, t.createdAt),
]);
export const notificationTemplates = mysqlTable("notification_templates", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    /** Handlebars-style {{placeholders}} */
    subjectTemplate: text("subject_template").notNull(),
    bodyTemplate: text("body_template").notNull(),
    channels: json("channels").notNull().default(["in_app"]),
    isActive: int("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("notif_templates_tenant_key_idx").on(t.tenantId, t.key)]);
/**
 * Notification Rules — which domain events notify whom on which channels.
 */
export const notificationRules = mysqlTable("notification_rules", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    /** Domain event type this rule listens to, e.g. "integration.failed" */
    eventType: varchar("event_type", { length: 191 }).notNull(),
    templateKey: varchar("template_key", { length: 191 }).notNull(),
    channels: json("channels").notNull().default(["in_app"]),
    /** Audience: {roles: [], userIds: [], clientPortal: bool} */
    audience: json("audience").notNull().default({}),
    conditions: json("conditions").notNull().default({}),
    isActive: int("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("notif_rules_event_idx").on(t.tenantId, t.eventType)]);
export const featureRequests = mysqlTable("feature_requests", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    /** open | planned | in_progress | shipped | declined */
    status: varchar("status", { length: 191 }).notNull().default("open"),
    submittedBy: varchar("submitted_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    voteCount: int("vote_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("feature_requests_tenant_idx").on(t.tenantId, t.status)]);
export const votes = mysqlTable("votes", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    featureRequestId: varchar("feature_request_id", { length: 36 })
        .notNull()
        .references(() => featureRequests.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("votes_unique_idx").on(t.featureRequestId, t.userId)]);
export const aiJobStatusEnum = [
    "queued",
    "running",
    "completed",
    "failed",
    "cancelled",
];
/**
 * AIJobs — every AI worker job, tracked end to end with cost linkage.
 */
export const aiJobs = mysqlTable("ai_jobs", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "set null" }),
    /** report | dmaic | aeo_audit | meeting_analysis | sow | recommendation_verify | forecast | embedding | lead_audit | qbr | digest */
    jobType: varchar("job_type", { length: 191 }).notNull(),
    status: varchar("status", { length: 64 }).notNull().default("queued"),
    input: json("input").notNull().default({}),
    output: json("output").notNull().default({}),
    /** BullMQ job id for cross-referencing queue_jobs */
    queueJobId: varchar("queue_job_id", { length: 191 }),
    error: text("error"),
    attempts: int("attempts").notNull().default(0),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
    index("ai_jobs_tenant_idx").on(t.tenantId, t.status),
    index("ai_jobs_type_idx").on(t.jobType, t.status),
]);
/**
 * QueueJobs — durable mirror of BullMQ job lifecycle for the System
 * Health Dashboard (queue depth, failures, latency).
 */
export const queueJobs = mysqlTable("queue_jobs", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id, { onDelete: "cascade" }),
    queueName: varchar("queue_name", { length: 191 }).notNull(),
    jobName: varchar("job_name", { length: 191 }).notNull(),
    bullJobId: varchar("bull_job_id", { length: 191 }).notNull(),
    /** waiting | active | completed | failed | delayed */
    status: varchar("status", { length: 191 }).notNull().default("waiting"),
    payloadSummary: json("payload_summary").notNull().default({}),
    /** Full job payload the in-app worker executes (not just the summary). */
    payload: json("payload").notNull().default({}),
    error: text("error"),
    attempts: int("attempts").notNull().default(0),
    maxAttempts: int("max_attempts").notNull().default(3),
    durationMs: int("duration_ms"),
    /** When this job becomes eligible to run (delays + exponential backoff). */
    availableAt: timestamp("available_at").notNull().defaultNow(),
    /** Claim lock so the poll loop never runs a job twice. */
    lockedAt: timestamp("locked_at"),
    lockedBy: varchar("locked_by", { length: 191 }),
    enqueuedAt: timestamp("enqueued_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
}, (t) => [
    index("queue_jobs_queue_idx").on(t.queueName, t.status),
    index("queue_jobs_bull_idx").on(t.bullJobId),
    index("queue_jobs_poll_idx").on(t.status, t.availableAt),
]);
/**
 * Domain Event Layer — every published event is persisted here before
 * fan-out, decoupling producers from consumers.
 */
export const domainEvents = mysqlTable("domain_events", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 }).references(() => tenants.id, { onDelete: "cascade" }),
    /** e.g. client.created, meeting.analyzed, forecast.generated, integration.failed */
    eventType: varchar("event_type", { length: 191 }).notNull(),
    payload: json("payload").notNull().default({}),
    /** Entity the event concerns */
    entityType: varchar("entity_type", { length: 191 }),
    entityId: varchar("entity_id", { length: 36 }),
    /** pending | dispatched | failed */
    dispatchStatus: varchar("dispatch_status", { length: 191 }).notNull().default("pending"),
    handlerResults: json("handler_results").notNull().default([]),
    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
    dispatchedAt: timestamp("dispatched_at"),
}, (t) => [
    index("domain_events_type_idx").on(t.eventType, t.occurredAt),
    index("domain_events_tenant_idx").on(t.tenantId, t.occurredAt),
]);
/**
 * Outbound webhook endpoints (tenant-configured) + delivery log.
 */
export const webhookEndpoints = mysqlTable("webhook_endpoints", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    /** Event types this endpoint subscribes to; ["*"] = all */
    eventTypes: json("event_types").notNull().default([]),
    /** HMAC signing secret (encrypted) */
    encryptedSecret: text("encrypted_secret"),
    isActive: int("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("webhook_endpoints_tenant_idx").on(t.tenantId)]);
export const webhookDeliveries = mysqlTable("webhook_deliveries", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    endpointId: varchar("endpoint_id", { length: 36 })
        .notNull()
        .references(() => webhookEndpoints.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 191 }).notNull(),
    payload: json("payload").notNull().default({}),
    responseStatus: int("response_status"),
    /** pending | delivered | failed */
    status: varchar("status", { length: 191 }).notNull().default("pending"),
    attempts: int("attempts").notNull().default(0),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("webhook_deliveries_endpoint_idx").on(t.endpointId, t.status)]);
/**
 * Disaster recovery bookkeeping — backup runs recorded for the ops portal.
 */
export const backupRecords = mysqlTable("backup_records", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    /** postgres | object_storage | full_snapshot */
    backupType: varchar("backup_type", { length: 191 }).notNull(),
    storageKey: text("storage_key"),
    sizeBytes: text("size_bytes"),
    /** running | completed | failed */
    status: varchar("status", { length: 191 }).notNull().default("running"),
    error: text("error"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    expiresAt: timestamp("expires_at"),
}, (t) => [index("backup_records_type_idx").on(t.backupType, t.startedAt)]);
//# sourceMappingURL=platform.js.map