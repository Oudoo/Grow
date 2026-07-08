import { randomUUID } from "node:crypto";
import { mysqlTable, text, timestamp, boolean, index, uniqueIndex, date, varchar, int, decimal, json, } from "drizzle-orm/mysql-core";
import { tenants } from "./tenancy.js";
import { clients } from "./clients.js";
export const integrationProviderEnum = [
    "meta",
    "ga4",
    "google_ads",
    "tiktok",
    "linkedin",
    "x",
    "zoho_crm",
    "hubspot",
    "salesforce",
    "dynamics",
    "odoo",
];
export const integrationStatusEnum = [
    "connected",
    "syncing",
    "error",
    "token_expired",
    "disconnected",
];
export const syncLogStatusEnum = [
    "started",
    "success",
    "partial",
    "failed",
];
/**
 * A connected external data source for a client. Credentials are encrypted
 * at rest (AES-256-GCM via packages/core crypto) — never stored in plaintext.
 */
export const integrations = mysqlTable("integrations", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    /** Human label, e.g. "Acme — Meta Ads (Main Account)" */
    name: varchar("name", { length: 191 }).notNull(),
    /** Provider-side account/property identifiers (ad account id, GA4 property id...) */
    externalAccountId: text("external_account_id"),
    /** AES-256-GCM encrypted JSON blob: tokens, refresh tokens, client secrets */
    encryptedCredentials: text("encrypted_credentials"),
    status: varchar("status", { length: 64 }).notNull().default("disconnected"),
    /** OAuth token expiry for the Integration Health Center */
    tokenExpiresAt: timestamp("token_expires_at"),
    lastSyncAt: timestamp("last_sync_at"),
    lastSuccessfulSyncAt: timestamp("last_successful_sync_at"),
    lastError: text("last_error"),
    consecutiveFailures: int("consecutive_failures").notNull().default(0),
    syncFrequencyMinutes: int("sync_frequency_minutes").notNull().default(360),
    config: json("config").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
    index("integrations_tenant_idx").on(t.tenantId),
    index("integrations_client_idx").on(t.clientId),
    index("integrations_status_idx").on(t.status),
]);
export const integrationLogs = mysqlTable("integration_logs", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    integrationId: varchar("integration_id", { length: 36 })
        .notNull()
        .references(() => integrations.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 64 }).notNull(),
    operation: varchar("operation", { length: 191 }).notNull(),
    /** Provider request IDs captured for the Verifiable Data Layer */
    apiRequestIds: json("api_request_ids").notNull().default([]),
    recordsFetched: int("records_fetched").notNull().default(0),
    recordsStored: int("records_stored").notNull().default(0),
    /** Sanity Check Engine findings for this sync run */
    sanityFindings: json("sanity_findings").notNull().default([]),
    error: text("error"),
    durationMs: int("duration_ms"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
}, (t) => [
    index("integration_logs_tenant_idx").on(t.tenantId),
    index("integration_logs_integration_idx").on(t.integrationId, t.startedAt),
]);
/**
 * Normalized daily metric facts pulled from providers. This is the
 * Verifiable Data Layer: every row carries its provider request id and a
 * reference link so any number on a dashboard can be traced to its source.
 */
export const metricRecords = mysqlTable("metric_records", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
        .notNull()
        .references(() => clients.id, { onDelete: "cascade" }),
    integrationId: varchar("integration_id", { length: 36 })
        .notNull()
        .references(() => integrations.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    /** Metric key: spend, impressions, clicks, conversions, revenue, sessions... */
    metric: varchar("metric", { length: 191 }).notNull(),
    /** Dimension scope, e.g. {"campaign_id": "...", "channel": "paid_social"} */
    dimensions: json("dimensions").notNull().default({}),
    date: date("date", { mode: "string" }).notNull(),
    value: decimal("value", { precision: 18, scale: 4 }).notNull(),
    currency: varchar("currency", { length: 191 }),
    /** Verifiable Data Layer: provider API request id (x-fb-trace-id etc.) */
    sourceRequestId: text("source_request_id"),
    /** Direct deep link back to the provider UI / API resource */
    sourceReferenceUrl: text("source_reference_url"),
    /** Sanity Check Engine verdict */
    sanityStatus: varchar("sanity_status", { length: 191 }).notNull().default("passed"),
    sanityNotes: json("sanity_notes").notNull().default([]),
    fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("metric_records_unique_fact_idx").on(t.integrationId, t.metric, t.date, t.dimensions),
    index("metric_records_tenant_client_idx").on(t.tenantId, t.clientId, t.date),
    index("metric_records_metric_idx").on(t.clientId, t.metric, t.date),
]);
/**
 * Redis-backed caching is the hot path; this table is the durable cache for
 * computed analytics aggregates (dashboards, digests, QBRs).
 */
export const analyticsCache = mysqlTable("analytics_cache", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "cascade" }),
    cacheKey: varchar("cache_key", { length: 191 }).notNull(),
    payload: json("payload").notNull(),
    /** Trace metadata: which metric_records / request ids fed this aggregate */
    sourceTrace: json("source_trace").notNull().default({}),
    computedAt: timestamp("computed_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"),
}, (t) => [
    uniqueIndex("analytics_cache_key_idx").on(t.tenantId, t.cacheKey),
]);
/**
 * API Rate Limit Manager bookkeeping — rolling quota usage per provider.
 */
export const apiQuotaUsage = mysqlTable("api_quota_usage", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    windowStart: timestamp("window_start").notNull(),
    requestCount: int("request_count").notNull().default(0),
    throttledCount: int("throttled_count").notNull().default(0),
    quotaLimit: int("quota_limit"),
    backoffUntil: timestamp("backoff_until"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("api_quota_window_idx").on(t.tenantId, t.provider, t.windowStart),
]);
/** Whether each provider sync is enabled tenant-wide (kill-switch). */
export const integrationKillSwitches = mysqlTable("integration_kill_switches", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    reason: text("reason"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("kill_switch_idx").on(t.tenantId, t.provider)]);
//# sourceMappingURL=integrations.js.map