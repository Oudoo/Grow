import { randomUUID } from "node:crypto";
import {
  mysqlTable,
  text,
  timestamp,
  index,
  date,
  varchar,
  int,
  decimal,
  json,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { tenants, users } from "./tenancy.js";
import { clients } from "./clients.js";

export const dmaicPhaseEnum = [
  "define",
  "measure",
  "analyze",
  "improve",
  "control",
  "completed",
] as const;

/**
 * Automated DMAIC Generator — converts findings into structured
 * Define/Measure/Analyze/Improve/Control projects with generated tasks.
 */
export const dmaicProjects = mysqlTable(
  "dmaic_projects",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    problemStatement: text("problem_statement").notNull(),
    currentPhase: varchar("current_phase", { length: 64 }).notNull().default("define"),
    /**
     * Full phase content keyed by phase:
     * {define: {goal, scope, stakeholders}, measure: {kpis, baselines}, ...}
     */
    phases: json("phases").notNull().default({}),
    /** Generated timeline: [{phase, startDate, endDate}] */
    timeline: json("timeline").notNull().default([]),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    dataSources: json("data_sources").notNull().default([]),
    evidenceCount: int("evidence_count").notNull().default(0),
    ownerId: varchar("owner_id", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    aiGenerated: int("ai_generated").notNull().default(1),
    sourceFindingType: text("source_finding_type"),
    sourceFindingId: varchar("source_finding_id", { length: 36 }),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("dmaic_tenant_idx").on(t.tenantId),
    index("dmaic_client_idx").on(t.clientId),
  ]
);

export const forecastStatusEnum = [
  "queued",
  "running",
  "completed",
  "failed",
] as const;

export const forecasts = mysqlTable(
  "forecasts",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    metric: varchar("metric", { length: 191 }).notNull(),
    horizonDays: int("horizon_days").notNull().default(30),
    status: varchar("status", { length: 64 }).notNull().default("queued"),
    /** Point forecasts with bounds: [{date, value, lower, upper}] */
    points: json("points").notNull().default([]),
    method: varchar("method", { length: 191 }).notNull().default("holt_winters"),
    /** AI Confidence Framework — mandatory on every forecast */
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    dataSources: json("data_sources").notNull().default([]),
    evidenceCount: int("evidence_count").notNull().default(0),
    /** Historical observations used (count + window) for traceability */
    trainingWindow: json("training_window").notNull().default({}),
    /** Backtest accuracy: MAPE on holdout */
    backtestMape: decimal("backtest_mape", { precision: 7, scale: 3 }),
    narrative: text("narrative"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [index("forecasts_client_idx").on(t.clientId, t.metric)]
);

/**
 * Lost Opportunity Quantifier — retroactive missed-revenue ranges due to
 * missed seasonal trends, with confidence scores.
 */
export const lostOpportunities = mysqlTable(
  "lost_opportunities",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    metric: varchar("metric", { length: 191 }).notNull(),
    missedValueLow: decimal("missed_value_low", { precision: 18, scale: 2 }).notNull(),
    missedValueHigh: decimal("missed_value_high", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 191 }).notNull().default("USD"),
    methodology: text("methodology").notNull(),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    dataSources: json("data_sources").notNull().default([]),
    evidenceCount: int("evidence_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("lost_opps_client_idx").on(t.clientId)]
);

/**
 * Seasonality patterns powering heatmaps and future budget-scaling maps.
 */
export const seasonalityPatterns = mysqlTable(
  "seasonality_patterns",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    metric: varchar("metric", { length: 191 }).notNull(),
    /** Heatmap cells: [{month, weekOfMonth?, index, label}] index=1.0 is baseline */
    heatmap: json("heatmap").notNull().default([]),
    /** Recommended budget multipliers for upcoming periods */
    budgetScalingMap: json("budget_scaling_map").notNull().default([]),
    yearsOfData: decimal("years_of_data", { precision: 4, scale: 1 }),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    computedAt: timestamp("computed_at").notNull().defaultNow(),
  },
  (t) => [index("seasonality_client_idx").on(t.clientId, t.metric)]
);

export const healthScores = mysqlTable(
  "health_scores",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    /** 0-100 composite */
    score: decimal("score", { precision: 5, scale: 2 }).notNull(),
    /** Component breakdown: performance, engagement, delivery, sentiment */
    components: json("components").notNull().default({}),
    trend: varchar("trend", { length: 191 }).notNull().default("stable"),
    drivers: json("drivers").notNull().default([]),
    computedAt: timestamp("computed_at").notNull().defaultNow(),
  },
  (t) => [index("health_scores_client_idx").on(t.clientId, t.computedAt)]
);

export const aeoAuditStatusEnum = [
  "queued",
  "crawling",
  "analyzing",
  "completed",
  "failed",
] as const;

/**
 * AEO/GEO Content Auditor — evaluates site copy against generative-AI
 * search standards (structured data, schema markup, citeable quotes).
 */
export const aeoAudits = mysqlTable(
  "aeo_audits",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    targetUrl: text("target_url").notNull(),
    status: varchar("status", { length: 64 }).notNull().default("queued"),
    pagesCrawled: int("pages_crawled").notNull().default(0),
    /** 0-100 overall AEO readiness */
    overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
    /** Per-dimension scores: structuredData, schemaMarkup, citeableQuotes, answerability, freshness */
    dimensionScores: json("dimension_scores").notNull().default({}),
    /** Page-level findings: [{url, issues[], strengths[], score}] */
    pageFindings: json("page_findings").notNull().default([]),
    recommendations: json("recommendations").notNull().default([]),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    error: text("error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [index("aeo_audits_client_idx").on(t.clientId)]
);

export const leadAuditStatusEnum = [
  "submitted",
  "processing",
  "completed",
  "failed",
  "converted",
] as const;

/**
 * Interactive Business Audit Lead Magnet submissions — public widget for
 * prospective clients; completed audits are upsell triggers.
 */
export const leadAudits = mysqlTable(
  "lead_audits",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    websiteUrl: text("website_url").notNull(),
    industry: varchar("industry", { length: 191 }),
    monthlyAdBudget: text("monthly_ad_budget"),
    primaryGoal: text("primary_goal"),
    /** Widget questionnaire answers */
    responses: json("responses").notNull().default({}),
    status: varchar("status", { length: 64 }).notNull().default("submitted"),
    /** Generated high-level audit report (markdown) */
    auditReport: text("audit_report"),
    auditScore: decimal("audit_score", { precision: 5, scale: 2 }),
    auditFindings: json("audit_findings").notNull().default([]),
    utmSource: text("utm_source"),
    error: text("error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [index("lead_audits_tenant_idx").on(t.tenantId, t.createdAt)]
);

/**
 * Process Intelligence Engine — operational bottleneck findings computed
 * from CRM + tickets + tasks + SLA + funnel data. The non-marketing
 * Business Advisory layer.
 */
export const processInsights = mysqlTable(
  "process_insights",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }).references(() => clients.id, { onDelete: "cascade" }),
    /** bottleneck | cycle_time | rework | approval_delay | capacity | funnel_leak */
    insightType: varchar("insight_type", { length: 191 }).notNull(),
    title: text("title").notNull(),
    finding: text("finding").notNull(),
    recommendedAction: text("recommended_action").notNull(),
    /** Supporting numbers: {leadVolumeChange, conversionChange, slaBreachRate...} */
    evidence: json("evidence").notNull().default({}),
    evidenceCount: int("evidence_count").notNull().default(0),
    confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
    dataSources: json("data_sources").notNull().default([]),
    severity: varchar("severity", { length: 191 }).notNull().default("medium"),
    status: varchar("status", { length: 191 }).notNull().default("open"),
    computedAt: timestamp("computed_at").notNull().defaultNow(),
  },
  (t) => [index("process_insights_tenant_idx").on(t.tenantId, t.computedAt)]
);
