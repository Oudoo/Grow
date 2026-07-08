import { randomUUID } from "node:crypto";
import { mysqlTable, text, timestamp, index, uniqueIndex, date, varchar, int, decimal, json, } from "drizzle-orm/mysql-core";
import { tenants } from "./tenancy.js";
import { clients } from "./clients.js";
export const subscriptionStatusEnum = [
    "trialing",
    "active",
    "past_due",
    "cancelled",
];
export const invoiceStatusEnum = [
    "draft",
    "issued",
    "paid",
    "overdue",
    "void",
];
/**
 * Billing domain — no payment gateway; gateway can be added later behind
 * the same entities (Stripe ids would live in `externalRefs`).
 */
export const plans = mysqlTable("plans", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    key: varchar("key", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    description: text("description"),
    monthlyPrice: decimal("monthly_price", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 191 }).notNull().default("USD"),
    /** Limits: {clients, users, aiTokensPerMonth, integrationsPerClient} */
    limits: json("limits").notNull().default({}),
    features: json("features").notNull().default([]),
    isActive: int("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("plans_key_idx").on(t.key)]);
export const subscriptions = mysqlTable("subscriptions", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    planId: varchar("plan_id", { length: 36 })
        .notNull()
        .references(() => plans.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 64 }).notNull().default("active"),
    currentPeriodStart: date("current_period_start", { mode: "string" }).notNull(),
    currentPeriodEnd: date("current_period_end", { mode: "string" }).notNull(),
    cancelAtPeriodEnd: int("cancel_at_period_end").notNull().default(0),
    externalRefs: json("external_refs").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("subscriptions_tenant_idx").on(t.tenantId)]);
export const invoices = mysqlTable("invoices", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    /** Optional: agency invoicing its own client */
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "set null" }),
    subscriptionId: varchar("subscription_id", { length: 36 }).references(() => subscriptions.id, {
        onDelete: "set null",
    }),
    number: varchar("number", { length: 191 }).notNull(),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    lineItems: json("line_items").notNull().default([]),
    subtotal: decimal("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
    tax: decimal("tax", { precision: 14, scale: 2 }).notNull().default("0"),
    total: decimal("total", { precision: 14, scale: 2 }).notNull().default("0"),
    currency: varchar("currency", { length: 191 }).notNull().default("USD"),
    issuedAt: timestamp("issued_at"),
    dueAt: timestamp("due_at"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("invoices_tenant_number_idx").on(t.tenantId, t.number),
    index("invoices_tenant_idx").on(t.tenantId, t.status),
]);
/**
 * Metered usage per tenant: AI tokens, API calls, storage, syncs.
 */
export const usageRecords = mysqlTable("usage_records", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    /** ai_tokens | api_calls | storage_bytes | integration_syncs | transcription_minutes */
    meter: varchar("meter", { length: 191 }).notNull(),
    quantity: decimal("quantity", { precision: 18, scale: 4 }).notNull(),
    /** Aggregation day for rollups */
    usageDate: date("usage_date", { mode: "string" }).notNull(),
    metadata: json("metadata").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("usage_tenant_meter_idx").on(t.tenantId, t.meter, t.usageDate)]);
/**
 * Cost Tracking — every AI call's token usage and cost, attributable to a
 * tenant, client, project, and feature for the Cost Tracking Dashboard.
 */
export const costTracking = mysqlTable("cost_tracking", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "set null" }),
    projectId: varchar("project_id", { length: 36 }),
    /** anthropic | openai | whisper_local | embedding */
    provider: varchar("provider", { length: 191 }).notNull(),
    model: varchar("model", { length: 191 }).notNull(),
    /** Which platform feature consumed it: dmaic, meeting_analysis, aeo_audit... */
    feature: text("feature").notNull(),
    inputTokens: int("input_tokens").notNull().default(0),
    outputTokens: int("output_tokens").notNull().default(0),
    costUsd: decimal("cost_usd", { precision: 12, scale: 6 }).notNull().default("0"),
    aiJobId: varchar("ai_job_id", { length: 36 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
    index("cost_tracking_tenant_idx").on(t.tenantId, t.createdAt),
    index("cost_tracking_feature_idx").on(t.tenantId, t.feature),
]);
//# sourceMappingURL=billing.js.map