import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import "dotenv/config";
import * as schema from "./schema/index.js";

/**
 * Demo seed — OPTIONAL, for proof-of-concept / UAT only. Creates a fully
 * populated "demo-agency" workspace with 120 days of realistic synthetic
 * metrics so every module renders with data before real API keys are added.
 * Never run this against a production database you care about.
 *
 * Logins after seeding:
 *   workspace: demo-agency
 *   team admin:    admin@demo.growengine.app  / DemoAdmin2026!
 *   client portal: client@acme-outdoor.com    / DemoClient2026!
 */

const connectionString =
  process.env.DATABASE_URL ??
  "mysql://growengine:growengine_dev@localhost:3306/growengine";

const PERMISSION_KEYS = [
  "clients:read", "clients:manage", "integrations:read", "integrations:manage",
  "meetings:read", "meetings:manage", "intelligence:read", "intelligence:manage",
  "creative:read", "creative:manage", "work:read", "work:manage",
  "aom:read", "aom:manage", "billing:read", "billing:admin",
  "settings:admin", "system:admin",
];

async function main() {
  const connection = await mysql.createConnection({ uri: connectionString });
  const db = drizzle(connection, { schema, mode: "default" });

  const existing = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.slug, "demo-agency"));
  if (existing.length > 0) {
    console.log("demo-agency already exists — skipping seed.");
    await connection.end();
    return;
  }

  console.log("Seeding demo workspace…");

  const tenantId = randomUUID();
  await db.insert(schema.tenants).values({ id: tenantId, name: "Demo Agency", slug: "demo-agency" });

  // Permissions + roles
  for (const key of PERMISSION_KEYS) {
    await db.insert(schema.permissions).values({ id: randomUUID(), key }).onDuplicateKeyUpdate({ set: { key } });
  }
  const allPerms = await db.select().from(schema.permissions);
  const adminRoleId = randomUUID();
  await db.insert(schema.roles).values({ id: adminRoleId, tenantId, name: "Admin", isSystem: true });
  for (const p of allPerms) {
    await db
      .insert(schema.rolePermissions)
      .values({ roleId: adminRoleId, permissionId: p.id })
      .onDuplicateKeyUpdate({ set: { roleId: adminRoleId } });
  }
  const amRoleId = randomUUID();
  await db.insert(schema.roles).values({ id: amRoleId, tenantId, name: "Account Manager", isSystem: true });
  for (const p of allPerms.filter((x) => !x.key.includes("admin"))) {
    await db
      .insert(schema.rolePermissions)
      .values({ roleId: amRoleId, permissionId: p.id })
      .onDuplicateKeyUpdate({ set: { roleId: amRoleId } });
  }
  await db.insert(schema.roles).values({ id: randomUUID(), tenantId, name: "Client User", isSystem: true });

  // Users
  const adminId = randomUUID();
  await db.insert(schema.users).values({
    id: adminId,
    tenantId,
    email: "admin@demo.growengine.app",
    name: "Dana Admin",
    passwordHash: await bcrypt.hash("DemoAdmin2026!", 12),
    isSuperAdmin: true,
  });
  await db.insert(schema.userRoles).values({ userId: adminId, roleId: adminRoleId });

  const pmId = randomUUID();
  await db.insert(schema.users).values({
    id: pmId,
    tenantId,
    email: "pm@demo.growengine.app",
    name: "Pat Manager",
    passwordHash: await bcrypt.hash("DemoAdmin2026!", 12),
  });
  await db.insert(schema.userRoles).values({ userId: pmId, roleId: amRoleId });

  // Plan + subscription
  const planId = randomUUID();
  await db
    .insert(schema.plans)
    .values({
      id: planId,
      key: "growth",
      name: "Growth",
      monthlyPrice: "499",
      limits: { clients: 25, users: 25, aiTokensPerMonth: 10_000_000 },
      features: ["all_modules"],
    })
    .onDuplicateKeyUpdate({ set: { key: "growth" } });
  const planRow = (await db.select().from(schema.plans).where(eq(schema.plans.key, "growth")))[0];
  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await db.insert(schema.subscriptions).values({
    id: randomUUID(),
    tenantId,
    planId: planRow.id,
    status: "active",
    currentPeriodStart: periodStart.toISOString().slice(0, 10),
    currentPeriodEnd: periodEnd.toISOString().slice(0, 10),
  });

  // Retention policies
  for (const [category, days] of [["analytics", 730], ["transcripts", 365], ["recordings", 180], ["audit_logs", 730], ["notifications", 90]] as const) {
    await db.insert(schema.dataRetentionPolicies).values({
      id: randomUUID(), tenantId, dataCategory: category, retentionDays: days,
    });
  }

  // Client + portal user
  const clientId = randomUUID();
  await db.insert(schema.clients).values({
    id: clientId,
    tenantId,
    name: "Acme Outdoor Gear",
    slug: "acme-outdoor",
    industry: "E-commerce / Outdoor",
    websiteUrl: "https://www.rei.com",
    status: "active",
    accountManagerId: pmId,
    monthlyRetainer: "4500",
    milestoneTargets: [
      { label: "Hit $250k monthly revenue", metric: "revenue", target: 250000 },
      { label: "1,000 leads in a month", metric: "leads", target: 1000 },
    ],
  });

  await db.insert(schema.users).values({
    id: randomUUID(),
    tenantId,
    email: "client@acme-outdoor.com",
    name: "Casey Client",
    passwordHash: await bcrypt.hash("DemoClient2026!", 12),
    clientId,
  });

  await db.insert(schema.projects).values({
    id: randomUUID(),
    tenantId,
    clientId,
    name: "Always-on Paid Social",
    description: "Meta + TikTok prospecting and retargeting",
    ownerId: pmId,
  });

  // Demo integrations (no real credentials — clearly marked)
  const metaIntegrationId = randomUUID();
  await db.insert(schema.integrations).values({
    id: metaIntegrationId,
    tenantId,
    clientId,
    provider: "meta",
    name: "Acme — Meta Ads (DEMO DATA)",
    externalAccountId: "act_000000000000000",
    status: "connected",
    lastSyncAt: new Date(),
    lastSuccessfulSyncAt: new Date(),
    syncFrequencyMinutes: 10080,
    config: { demo: true },
  });
  const ga4IntegrationId = randomUUID();
  await db.insert(schema.integrations).values({
    id: ga4IntegrationId,
    tenantId,
    clientId,
    provider: "ga4",
    name: "Acme — GA4 (DEMO DATA)",
    externalAccountId: "000000000",
    status: "connected",
    lastSyncAt: new Date(),
    lastSuccessfulSyncAt: new Date(),
    syncFrequencyMinutes: 10080,
    config: { demo: true },
  });

  // 120 days of realistic synthetic metrics (weekly + monthly seasonality, noise, trend)
  console.log("Generating 120 days of synthetic metrics…");
  const today = new Date();
  const rand = mulberry32(42);
  const monthIndex = [0.85, 0.9, 1.0, 1.05, 1.1, 1.15, 1.05, 0.95, 1.0, 1.1, 1.35, 1.5];
  const rows: (typeof schema.metricRecords.$inferInsert)[] = [];
  for (let d = 120; d >= 1; d--) {
    const date = new Date(today.getTime() - d * 86400_000);
    const iso = date.toISOString().slice(0, 10);
    const dow = date.getUTCDay();
    const weekly = dow === 0 || dow === 6 ? 0.8 : 1 + (dow === 2 || dow === 3 ? 0.1 : 0);
    const seasonal = monthIndex[date.getUTCMonth()];
    const trend = 1 + (120 - d) * 0.002;
    const noise = () => 0.85 + rand() * 0.3;

    const spend = 1500 * weekly * seasonal * trend * noise();
    const impressions = spend * (95 + rand() * 25);
    const clicks = impressions * (0.012 + rand() * 0.006);
    const conversions = clicks * (0.03 + rand() * 0.015);
    const revenue = conversions * (140 + rand() * 60);
    const sessions = clicks * (1.6 + rand() * 0.5);
    const leads = conversions * (2.4 + rand() * 0.8);

    const mk = (integrationId: string, provider: "meta" | "ga4", metric: string, value: number, currency?: string) => ({
      id: randomUUID(),
      tenantId,
      clientId,
      integrationId,
      provider,
      metric,
      dimensions: {},
      date: iso,
      value: value.toFixed(4),
      currency,
      sourceRequestId: `demo-seed-${provider}-${iso}`,
      sourceReferenceUrl: provider === "meta" ? "https://adsmanager.facebook.com" : "https://analytics.google.com",
      sanityStatus: "passed",
    });

    rows.push(
      mk(metaIntegrationId, "meta", "spend", spend, "USD"),
      mk(metaIntegrationId, "meta", "impressions", impressions),
      mk(metaIntegrationId, "meta", "clicks", clicks),
      mk(metaIntegrationId, "meta", "conversions", conversions),
      mk(metaIntegrationId, "meta", "revenue", revenue, "USD"),
      mk(metaIntegrationId, "meta", "leads", leads),
      mk(ga4IntegrationId, "ga4", "sessions", sessions),
      mk(ga4IntegrationId, "ga4", "total_users", sessions * 0.8)
    );
  }
  for (let i = 0; i < rows.length; i += 500) {
    await db.insert(schema.metricRecords).values(rows.slice(i, i + 500));
  }

  // Work items
  await db.insert(schema.tickets).values({
    id: randomUUID(),
    tenantId,
    clientId,
    number: 1,
    subject: "Update landing page hero for spring campaign",
    description: "Client wants the spring collection hero swapped before the pilot launches.",
    status: "in_progress",
    priority: "high",
    requesterId: adminId,
    assigneeId: pmId,
    slaDueAt: new Date(Date.now() + 24 * 3600_000),
    firstResponseAt: new Date(),
  });

  const taskId = randomUUID();
  await db.insert(schema.tasks).values({
    id: taskId,
    tenantId,
    clientId,
    title: "Build spring lookalike audiences",
    description: "1% and 3% LALs from 90-day purchasers.",
    status: "in_progress",
    priority: "medium",
    assigneeId: pmId,
    startedAt: new Date(Date.now() - 2 * 86400_000),
    dueDate: new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10),
    estimateHours: "6",
  });
  await db.insert(schema.subTasks).values({
    id: randomUUID(),
    tenantId,
    taskId,
    title: "Export purchaser seed list",
    status: "done",
    completedAt: new Date(),
  });

  // Creative + pending CAT approval (visible in the client portal immediately)
  const assetId = randomUUID();
  await db.insert(schema.creativeAssets).values({
    id: assetId,
    tenantId,
    clientId,
    name: "Spring Launch — UGC video v2",
    assetType: "video",
    status: "awaiting_client_approval",
    copyText:
      "Gear up for spring. ⛰️ Real adventurers, real reviews — 20% off this week only. Shop the spring collection now.",
    platforms: ["meta", "tiktok"],
    createdBy: pmId,
  });
  await db.insert(schema.catApprovals).values({
    id: randomUUID(),
    tenantId,
    clientId,
    creativeAssetId: assetId,
    requestedBy: pmId,
    checklist: [
      { key: "brand", label: "On-brand visuals and tone", confirmed: false },
      { key: "claims", label: "All claims are accurate and substantiated", confirmed: false },
      { key: "compliance", label: "Meets platform & legal compliance", confirmed: false },
    ],
    expiresAt: new Date(Date.now() + 14 * 86400_000),
  });

  // A verified recommendation + decision in the AOM
  const recId = randomUUID();
  await db.insert(schema.recommendations).values({
    id: recId,
    tenantId,
    clientId,
    title: "Shift 20% of prospecting budget to retargeting",
    body: "Retargeting CPA has been consistently lower than prospecting over the trailing 60 days while volume headroom remains. Recommend shifting 20% of prospecting budget to retargeting and re-evaluating after two weeks.",
    category: "budget",
    status: "verified",
    evidence: [
      {
        claim: "Retargeting CPA is lower than prospecting CPA over 60 days",
        verdict: "supported",
        evidence: "Blended CPA from seeded demo metrics trends down while conversion volume rises.",
        metricRecordIds: [],
        sourceRequestIds: ["demo-seed-meta"],
      },
    ],
    evidenceCount: 240,
    confidenceScore: "84",
    dataSources: ["meta", "ga4"],
    proposedBy: pmId,
    aiGenerated: 0,
  });
  await db.insert(schema.decisions).values({
    id: randomUUID(),
    tenantId,
    clientId,
    title: "Decision on: Shift 20% of prospecting budget to retargeting",
    outcome: "approved",
    reason: "Aligned with Q2 efficiency targets.",
    approvedByName: "Casey Client",
    sourceEntityType: "recommendation",
    sourceEntityId: recId,
  });

  // Knowledge document
  await db.insert(schema.knowledgeDocuments).values({
    id: randomUUID(),
    tenantId,
    clientId,
    type: "note",
    title: "Kickoff notes — Acme Outdoor Gear",
    contentMarkdown:
      "# Kickoff notes\n\n- Primary goal: profitable revenue scaling to $250k/month\n- Secondary: build a lead engine for the wholesale arm (1,000 leads/month)\n- Brand guardrails: no discount-led messaging outside seasonal windows\n- TikTok is a growth bet for Q2; client cautious about pricing-focused creative",
    authorId: pmId,
  });

  // Notification template + rule example
  await db.insert(schema.notificationTemplates).values({
    id: randomUUID(),
    tenantId,
    key: "integration_failed",
    name: "Integration failure alert",
    subjectTemplate: "Integration {{provider}} failed",
    bodyTemplate: "Provider {{provider}} reported: {{error}}",
    channels: ["in_app", "email"],
  });
  await db.insert(schema.notificationRules).values({
    id: randomUUID(),
    tenantId,
    eventType: "integration.failed",
    templateKey: "integration_failed",
    channels: ["in_app"],
    audience: { roles: ["Admin"] },
  });

  console.log("Seed complete.");
  console.log("  workspace: demo-agency");
  console.log("  team:      admin@demo.growengine.app / DemoAdmin2026!");
  console.log("  portal:    client@acme-outdoor.com  / DemoClient2026!");
  await connection.end();
}

/** Deterministic PRNG so seeded data is reproducible. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
