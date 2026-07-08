import { randomUUID } from "node:crypto";
import { mysqlTable, text, timestamp, boolean, uniqueIndex, varchar, json, } from "drizzle-orm/mysql-core";
import { tenants } from "./tenancy.js";
/**
 * Feature flag system — platform features that can be toggled per tenant.
 */
export const features = mysqlTable("features", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    /** e.g. "dmaic", "aeo_auditor", "process_intelligence" */
    key: varchar("key", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    description: text("description"),
    /** Default state for tenants without an explicit flag. */
    defaultEnabled: boolean("default_enabled").notNull().default(true),
    isBeta: boolean("is_beta").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("features_key_idx").on(t.key)]);
export const featureFlags = mysqlTable("feature_flags", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    featureId: varchar("feature_id", { length: 36 })
        .notNull()
        .references(() => features.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull(),
    /** Optional rollout config: percentage, client allow-lists, etc. */
    config: json("config").notNull().default({}),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("feature_flags_tenant_feature_idx").on(t.tenantId, t.featureId)]);
//# sourceMappingURL=features.js.map