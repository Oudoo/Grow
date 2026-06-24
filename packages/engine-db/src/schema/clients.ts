import { randomUUID } from "node:crypto";
import {
  mysqlTable,
  text,
  timestamp,
  index,
  uniqueIndex,
  date,
  varchar,
  decimal,
  json,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { tenants, users } from "./tenancy.js";

export const clientStatusEnum = [
  "prospect",
  "onboarding",
  "active",
  "paused",
  "offboarded",
] as const;

export const projectStatusEnum = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;

export const clients = mysqlTable(
  "clients",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 191 }).notNull(),
    /** Used in the client portal URL: /client/[slug] */
    slug: varchar("slug", { length: 191 }).notNull(),
    industry: varchar("industry", { length: 191 }),
    websiteUrl: text("website_url"),
    status: varchar("status", { length: 64 }).notNull().default("active"),
    accountManagerId: varchar("account_manager_id", { length: 36 }).references(() => users.id, {
      onDelete: "set null",
    }),
    monthlyRetainer: decimal("monthly_retainer", { precision: 12, scale: 2 }),
    /** Gamified milestone targets: revenue, leads, ROAS etc. */
    milestoneTargets: json("milestone_targets").notNull().default([]),
    settings: json("settings").notNull().default({}),
    onboardedAt: date("onboarded_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("clients_tenant_slug_idx").on(t.tenantId, t.slug),
    index("clients_tenant_idx").on(t.tenantId),
  ]
);

export const projects = mysqlTable(
  "projects",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 })
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 191 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 64 }).notNull().default("active"),
    ownerId: varchar("owner_id", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    budget: decimal("budget", { precision: 12, scale: 2 }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    metadata: json("metadata").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("projects_tenant_idx").on(t.tenantId),
    index("projects_client_idx").on(t.clientId),
  ]
);
