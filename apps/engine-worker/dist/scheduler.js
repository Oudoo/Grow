import { and, eq, lt, sql as dsql } from "drizzle-orm";
import { db, integrations, tenants, clients } from "@growengine/db";
import { enqueueIntegrationJob, enqueueAiJob, enqueueNotificationJob, publishEvent, EVENT_TYPES, isMayaConfigured, pollMayaMeetings, getDevFlags, isAiConfigured, withDbLock, } from "@growengine/core";
/**
 * Scheduler — periodic orchestration on setInterval ticks. Every app copy
 * runs these timers (Passenger runs several), so each tick takes a
 * DATABASE lock before doing anything: the copy that wins does the work, the
 * others skip. The lock used to be in the in-memory store, which is per
 * process — three copies each ran the daily tick on 2026-09-13.
 */
async function withLock(key, ttlSeconds, fn) {
    await withDbLock(`scheduler:${key}`, ttlSeconds, fn);
}
/**
 * Same, but honouring the Developer console's "Scheduled jobs" switch. Maya's
 * meeting poll deliberately does NOT go through this: a meeting in progress
 * must keep syncing whatever the owner pauses.
 */
async function withScheduledLock(key, ttlSeconds, fn) {
    const flags = await getDevFlags();
    if (!flags["scheduler.enabled"])
        return;
    await withLock(key, ttlSeconds, fn);
}
/** Every 5 minutes: queue syncs for integrations whose frequency elapsed. */
async function scheduleDueSyncs() {
    const due = await db
        .select()
        .from(integrations)
        .where(and(dsql `${integrations.status} IN ('connected','error')`, dsql `(${integrations.lastSyncAt} IS NULL OR ${integrations.lastSyncAt} < NOW() - INTERVAL ${integrations.syncFrequencyMinutes} MINUTE)`, dsql `${integrations.consecutiveFailures} < 10`))
        .limit(50);
    for (const integration of due) {
        await enqueueIntegrationJob({
            tenantId: integration.tenantId,
            integrationId: integration.id,
            operation: "sync",
        });
    }
}
/** Hourly: refresh tokens expiring within 72h and warn at 7 days. */
async function scheduleTokenRefresh() {
    const expiring = await db
        .select()
        .from(integrations)
        .where(and(dsql `${integrations.tokenExpiresAt} IS NOT NULL`, lt(integrations.tokenExpiresAt, new Date(Date.now() + 72 * 3600_000))));
    for (const integration of expiring) {
        await enqueueIntegrationJob({
            tenantId: integration.tenantId,
            integrationId: integration.id,
            operation: "refresh_token",
        });
        await publishEvent({
            tenantId: integration.tenantId,
            eventType: EVENT_TYPES.integrationTokenExpiring,
            entityType: "integration",
            entityId: integration.id,
            payload: {
                provider: integration.provider,
                name: integration.name,
                expiresAt: integration.tokenExpiresAt?.toISOString(),
            },
        });
    }
}
/** Daily jobs: retention enforcement, process intelligence, weekly digests on Mondays, monthly on the 1st, scorecards on the 1st. */
async function scheduleDaily() {
    // Without a provider key (or with AI switched off) every AI job would fail
    // three times and park itself — 32 such rows accumulated in the two days
    // before this guard existed. Digests are AI too; nothing daily survives
    // without AI, so the whole tick is skipped and says so once.
    const flags = await getDevFlags();
    if (!isAiConfigured() || !flags["ai.enabled"]) {
        console.log("[scheduler] daily AI jobs skipped — AI is not configured or is switched off.");
        return;
    }
    const allTenants = await db.select().from(tenants).where(eq(tenants.status, "active"));
    const now = new Date();
    const isMonday = now.getUTCDay() === 1;
    const isFirstOfMonth = now.getUTCDate() === 1;
    for (const tenant of allTenants) {
        await enqueueAiJob({
            tenantId: tenant.id,
            aiJobId: "",
            jobType: "retention_enforcement",
            input: {},
        });
        await enqueueAiJob({
            tenantId: tenant.id,
            aiJobId: "",
            jobType: "process_intelligence",
            input: {},
        });
        if (isMonday) {
            await enqueueNotificationJob({ tenantId: tenant.id, kind: "digest_weekly", input: {} });
        }
        if (isFirstOfMonth) {
            await enqueueNotificationJob({ tenantId: tenant.id, kind: "digest_monthly", input: {} });
            const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
            const periodStart = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth(), 1));
            await enqueueAiJob({
                tenantId: tenant.id,
                aiJobId: "",
                jobType: "scorecards",
                input: {
                    periodStart: periodStart.toISOString().slice(0, 10),
                    periodEnd: periodEnd.toISOString().slice(0, 10),
                },
            });
        }
        // Refresh health scores for active clients daily
        const activeClients = await db
            .select({ id: clients.id })
            .from(clients)
            .where(and(eq(clients.tenantId, tenant.id), eq(clients.status, "active")));
        for (const client of activeClients) {
            await enqueueAiJob({
                tenantId: tenant.id,
                aiJobId: "",
                jobType: "health_score",
                input: { clientId: client.id },
            });
        }
    }
}
export function startScheduler() {
    // Maya: while a meeting bot is live, pull its transcript every 20 s so the
    // meeting page shows live notes, and hand the meeting to analysis the tick
    // after Vexa reports it complete. One cheap SELECT per tick when nothing is
    // live; nothing at all when VEXA_API_KEY is unset. Vexa's webhook does the
    // same work sooner when it is registered — this is the guarantee behind it.
    const maya = isMayaConfigured()
        ? setInterval(() => withLock("maya_poll", 15, async () => { await pollMayaMeetings(); }).catch(console.error), 20_000)
        : null;
    const fiveMin = setInterval(() => withScheduledLock("due_syncs", 240, scheduleDueSyncs).catch(console.error), 5 * 60_000);
    const hourly = setInterval(() => withScheduledLock("token_refresh", 3500, scheduleTokenRefresh).catch(console.error), 60 * 60_000);
    const daily = setInterval(() => withScheduledLock(`daily:${new Date().toISOString().slice(0, 10)}`, 86_400, scheduleDaily).catch(console.error), 15 * 60_000);
    return () => {
        if (maya)
            clearInterval(maya);
        clearInterval(fiveMin);
        clearInterval(hourly);
        clearInterval(daily);
    };
}
//# sourceMappingURL=scheduler.js.map