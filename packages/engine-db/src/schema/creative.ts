import { randomUUID } from "node:crypto";
import {
  mysqlTable,
  text,
  timestamp,
  index,
  date,
  varchar,
  decimal,
  json,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { tenants, users } from "./tenancy.js";
import { clients, projects } from "./clients.js";

export const creativeAssetStatusEnum = [
  "draft",
  "internal_review",
  "awaiting_client_approval",
  "approved",
  "rejected",
  "in_pilot",
  "scaled",
  "retired",
] as const;

export const creativeAssets = mysqlTable(
  "creative_assets",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    projectId: varchar("project_id", { length: 36 }).references(() => projects.id, { onDelete: "set null" }),
    name: varchar("name", { length: 191 }).notNull(),
    /** image | video | carousel | copy | landing_page */
    assetType: varchar("asset_type", { length: 191 }).notNull(),
    status: varchar("status", { length: 64 }).notNull().default("draft"),
    /** Object storage key for the asset binary */
    storageKey: text("storage_key"),
    previewUrl: text("preview_url"),
    copyText: text("copy_text"),
    /** Target platform(s): meta, tiktok, linkedin... */
    platforms: json("platforms").notNull().default([]),
    metadata: json("metadata").notNull().default({}),
    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("creative_assets_client_idx").on(t.clientId, t.status)]
);

export const catApprovalStatusEnum = [
  "pending",
  "approved",
  "rejected",
  "changes_requested",
] as const;

/**
 * Creative Acceptance Testing (CAT) — strict client sign-off workflow.
 * Each row is one approval request presented in the client portal.
 */
export const catApprovals = mysqlTable(
  "cat_approvals",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    creativeAssetId: varchar("creative_asset_id", { length: 36 })
      .notNull()
      .references(() => creativeAssets.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 64 }).notNull().default("pending"),
    requestedBy: varchar("requested_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    /** Client-side signer (portal user) */
    decidedByUserId: varchar("decided_by_user_id", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    decidedByName: text("decided_by_name"),
    decisionNote: text("decision_note"),
    /** Sign-off checklist the client confirms: brand, claims, compliance */
    checklist: json("checklist").notNull().default([]),
    requestedAt: timestamp("requested_at").notNull().defaultNow(),
    decidedAt: timestamp("decided_at"),
    expiresAt: timestamp("expires_at"),
  },
  (t) => [index("cat_approvals_client_idx").on(t.clientId, t.status)]
);

export const abPilotStatusEnum = [
  "scheduled",
  "running",
  "completed",
  "promoted",
  "stopped",
] as const;

/**
 * 7-day micro-budget pilot tests run after CAT approval, before scaling.
 */
export const abPilots = mysqlTable(
  "ab_pilots",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    creativeAssetId: varchar("creative_asset_id", { length: 36 })
      .notNull()
      .references(() => creativeAssets.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 191 }).notNull(),
    status: varchar("status", { length: 64 }).notNull().default("scheduled"),
    platform: varchar("platform", { length: 191 }).notNull(),
    /** Provider-side campaign/adset ids for live result tracking */
    externalCampaignId: text("external_campaign_id"),
    dailyBudget: decimal("daily_budget", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 191 }).notNull().default("USD"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    /** Daily tracked results with source request ids */
    results: json("results").notNull().default([]),
    /** Final verdict: {winner, upliftPct, significance, recommendation} */
    verdict: json("verdict").notNull().default({}),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("ab_pilots_client_idx").on(t.clientId, t.status)]
);
