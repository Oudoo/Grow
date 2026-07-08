import { randomUUID } from "node:crypto";
import { mysqlTable, text, timestamp, boolean, index, uniqueIndex, primaryKey, varchar, int, json, } from "drizzle-orm/mysql-core";
export const tenantStatusEnum = [
    "active",
    "suspended",
    "trial",
    "churned",
];
export const userStatusEnum = [
    "active",
    "invited",
    "disabled",
];
/**
 * Tenants — root of all isolation. Every domain table carries tenantId.
 */
export const tenants = mysqlTable("tenants", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 191 }).notNull(),
    slug: varchar("slug", { length: 191 }).notNull(),
    status: varchar("status", { length: 64 }).notNull().default("active"),
    settings: json("settings").notNull().default({}),
    branding: json("branding").notNull().default({}),
    timezone: varchar("timezone", { length: 191 }).notNull().default("UTC"),
    currency: varchar("currency", { length: 191 }).notNull().default("USD"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("tenants_slug_idx").on(t.slug)]);
export const users = mysqlTable("users", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 191 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    passwordHash: text("password_hash"),
    avatarUrl: text("avatar_url"),
    status: varchar("status", { length: 64 }).notNull().default("active"),
    isSuperAdmin: boolean("is_super_admin").notNull().default(false),
    /** Client-portal users are scoped to a single client record. */
    clientId: varchar("client_id", { length: 36 }),
    lastLoginAt: timestamp("last_login_at"),
    preferences: json("preferences").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("users_tenant_email_idx").on(t.tenantId, t.email),
    index("users_tenant_idx").on(t.tenantId),
]);
export const roles = mysqlTable("roles", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 191 }).notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("roles_tenant_name_idx").on(t.tenantId, t.name)]);
export const permissions = mysqlTable("permissions", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    /** e.g. "clients:read", "dmaic:manage", "billing:admin" */
    key: varchar("key", { length: 191 }).notNull(),
    description: text("description"),
}, (t) => [uniqueIndex("permissions_key_idx").on(t.key)]);
export const rolePermissions = mysqlTable("role_permissions", {
    roleId: varchar("role_id", { length: 36 })
        .notNull()
        .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: varchar("permission_id", { length: 36 })
        .notNull()
        .references(() => permissions.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]);
export const userRoles = mysqlTable("user_roles", {
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 36 })
        .notNull()
        .references(() => roles.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.userId, t.roleId] })]);
export const tenantInvites = mysqlTable("tenant_invites", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 191 }).notNull(),
    roleId: varchar("role_id", { length: 36 }).references(() => roles.id, { onDelete: "set null" }),
    clientId: varchar("client_id", { length: 36 }),
    token: varchar("token", { length: 191 }).notNull(),
    invitedBy: varchar("invited_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("tenant_invites_token_idx").on(t.token)]);
/**
 * API keys for the public Grow Engine API. The key itself is stored hashed.
 */
export const apiKeys = mysqlTable("api_keys", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 191 }).notNull(),
    keyHash: varchar("key_hash", { length: 191 }).notNull(),
    keyPrefix: varchar("key_prefix", { length: 191 }).notNull(),
    scopes: json("scopes").notNull().default([]),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    createdBy: varchar("created_by", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("api_keys_hash_idx").on(t.keyHash),
    index("api_keys_tenant_idx").on(t.tenantId),
]);
/**
 * Data governance — configurable retention windows per data category.
 */
export const dataRetentionPolicies = mysqlTable("data_retention_policies", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tenantId: varchar("tenant_id", { length: 36 })
        .notNull()
        .references(() => tenants.id, { onDelete: "cascade" }),
    /** analytics | transcripts | recordings | audit_logs | notifications */
    dataCategory: varchar("data_category", { length: 191 }).notNull(),
    retentionDays: int("retention_days").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    lastEnforcedAt: timestamp("last_enforced_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
    uniqueIndex("retention_tenant_category_idx").on(t.tenantId, t.dataCategory),
]);
//# sourceMappingURL=tenancy.js.map