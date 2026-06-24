import { randomUUID } from "node:crypto";
import {
  mysqlTable,
  text,
  timestamp,
  index,
  varchar,
  int,
  decimal,
  json,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { tenants, users } from "./tenancy.js";
import { clients } from "./clients.js";

/**
 * Agency Operating Memory (AOM) — the competitive moat.
 * Every meaningful artifact (meetings, emails, reports, decisions, tickets,
 * tasks, recommendations, change requests) is linked and semantically
 * searchable through pgvector embeddings.
 */

export const knowledgeDocTypeEnum = [
  "report",
  "email",
  "note",
  "qbr",
  "expectation_baseline",
  "sow",
  "digest",
  "research",
  "other",
] as const;

export const knowledgeDocuments = mysqlTable(
  "knowledge_documents",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 64 }).notNull().default("note"),
    title: text("title").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    /** Optional binary attachment in object storage */
    storageKey: text("storage_key"),
    sourceEntityType: varchar("source_entity_type", { length: 191 }),
    sourceEntityId: varchar("source_entity_id", { length: 36 }),
    tags: json("tags").notNull().default([]),
    authorId: varchar("author_id", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("kdocs_tenant_idx").on(t.tenantId),
    index("kdocs_client_idx").on(t.clientId),
  ]
);

export const recommendationStatusEnum = [
  "proposed",
  "verified",
  "presented",
  "approved",
  "rejected",
  "implemented",
  "measured",
] as const;

export const recommendations = mysqlTable(
  "recommendations",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    /** marketing | operations | creative | budget | technical */
    category: varchar("category", { length: 191 }).notNull().default("marketing"),
    status: varchar("status", { length: 64 }).notNull().default("proposed"),
    /**
     * AI Recommendation Verification Engine output:
     * [{claim, evidence, metricRecordIds, sourceRequestIds, verdict}]
     */
    evidence: json("evidence").notNull().default([]),
    evidenceCount: int("evidence_count").notNull().default(0),
    /** AI Confidence Framework */
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    dataSources: json("data_sources").notNull().default([]),
    expectedImpact: json("expected_impact").notNull().default({}),
    /** Measured impact after implementation, for AOM historical queries */
    measuredImpact: json("measured_impact").notNull().default({}),
    proposedBy: varchar("proposed_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    aiGenerated: int("ai_generated").notNull().default(0),
    presentedAt: timestamp("presented_at"),
    decidedAt: timestamp("decided_at"),
    implementedAt: timestamp("implemented_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("recommendations_tenant_idx").on(t.tenantId),
    index("recommendations_client_status_idx").on(t.clientId, t.status),
  ]
);

export const decisionOutcomeEnum = [
  "approved",
  "rejected",
  "deferred",
  "modified",
] as const;

/**
 * Decisions — explicit records of what was decided, by whom, and why.
 * Linked to recommendations, meetings, or change requests.
 */
export const decisions = mysqlTable(
  "decisions",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    outcome: varchar("outcome", { length: 64 }).notNull(),
    reason: text("reason"),
    /** Free-text name + optional user link; client-side approvers may not be users */
    approvedByName: text("approved_by_name"),
    approvedByUserId: varchar("approved_by_user_id", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    /** Source link: recommendation | meeting | change_request | cat_approval */
    sourceEntityType: varchar("source_entity_type", { length: 191 }),
    sourceEntityId: varchar("source_entity_id", { length: 36 }),
    context: json("context").notNull().default({}),
    decidedAt: timestamp("decided_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("decisions_tenant_idx").on(t.tenantId),
    index("decisions_client_idx").on(t.clientId),
  ]
);

export const changeRequestStatusEnum = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "implemented",
] as const;

export const changeRequests = mysqlTable(
  "change_requests",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 64 }).notNull().default("submitted"),
    requestedByName: text("requested_by_name"),
    requestedByUserId: varchar("requested_by_user_id", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    impactAssessment: json("impact_assessment").notNull().default({}),
    estimatedManDays: decimal("estimated_man_days", { precision: 7, scale: 2 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("change_requests_client_idx").on(t.clientId)]
);

/**
 * Semantic search layer over the entire AOM. Each row is a chunk of a
 * source entity embedded with the configured embedding model (1536 dims,
 * OpenAI text-embedding-3-small by default).
 */
export const aomEmbeddings = mysqlTable(
  "aom_embeddings",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "cascade" }),
    /** meeting | transcript | knowledge_document | recommendation | decision | ticket | task | change_request */
    entityType: varchar("entity_type", { length: 191 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    chunkIndex: int("chunk_index").notNull().default(0),
    chunkText: text("chunk_text").notNull(),
    embedding: json("embedding"),
    embeddingModel: varchar("embedding_model", { length: 191 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("aom_embeddings_entity_idx").on(t.tenantId, t.entityType, t.entityId),
  ]
);

/**
 * Explicit graph links between AOM entities (meeting -> recommendation ->
 * decision -> task...), powering historical context queries.
 */
export const aomLinks = mysqlTable(
  "aom_links",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    fromEntityType: varchar("from_entity_type", { length: 191 }).notNull(),
    fromEntityId: varchar("from_entity_id", { length: 36 }).notNull(),
    toEntityType: varchar("to_entity_type", { length: 191 }).notNull(),
    toEntityId: varchar("to_entity_id", { length: 36 }).notNull(),
    /** generated_from | approved_by | implements | references | supersedes */
    linkType: varchar("link_type", { length: 191 }).notNull().default("references"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("aom_links_from_idx").on(t.tenantId, t.fromEntityType, t.fromEntityId),
    index("aom_links_to_idx").on(t.tenantId, t.toEntityType, t.toEntityId),
  ]
);
