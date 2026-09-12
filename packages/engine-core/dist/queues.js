import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import { db, queueJobs } from "@growengine/db";
/**
 * MySQL-backed job queue. Replaces Redis/BullMQ: every job is a durable row
 * in `queue_jobs`, claimed atomically (SELECT … FOR UPDATE SKIP LOCKED) by an
 * in-process poll loop that runs inside the unified Next.js server. No broker,
 * no extra service, $0 to operate at any scale of a single host.
 *
 * The Golden Architectural Rule still holds: heavy processing never runs in
 * the request cycle — enqueue() returns immediately; the in-app worker drains
 * the table on its own loop.
 */
export const QUEUE_NAMES = {
    integration: "integration",
    ai: "ai",
    research: "research",
    notification: "notification",
    events: "events",
};
const DEFAULT_ATTEMPTS = 3;
/**
 * Wake-on-enqueue. The web server and the workers share one process, so an
 * enqueue can nudge the loop for that queue directly instead of the loop
 * discovering the row on its next poll. This is what lets the idle poll
 * interval back off to seconds without adding seconds of latency to a job.
 */
const wakeWaiters = new Map();
function wake(queueName) {
    const waiters = wakeWaiters.get(queueName);
    if (!waiters)
        return;
    for (const resolve of waiters)
        resolve();
    waiters.clear();
}
function sleepOrWake(queueName, ms) {
    return new Promise((resolve) => {
        const waiters = wakeWaiters.get(queueName) ?? new Set();
        wakeWaiters.set(queueName, waiters);
        const timer = setTimeout(() => {
            waiters.delete(done);
            resolve();
        }, ms);
        function done() {
            clearTimeout(timer);
            resolve();
        }
        waiters.add(done);
    });
}
/**
 * The database's own words for a failed query. Drizzle wraps them in a
 * "Failed query: <the whole SQL and params>" message and hides the MySQL
 * error in `cause`, so a log line built from `message` says everything except
 * what went wrong. This says the cause first, and nothing else.
 */
export function describeDbError(err) {
    const e = err;
    const cause = e?.cause;
    if (cause && (cause.sqlMessage || cause.message))
        return `${cause.code ?? "DB_ERROR"}: ${cause.sqlMessage ?? cause.message}`;
    return String(e?.message ?? err).split("\n")[0].slice(0, 300);
}
/**
 * Whether queue_jobs has the columns the poll loop depends on. They arrived
 * in engine migration 0001, which production did not receive for weeks while
 * the boot migrator swallowed its own failure (scripts/migrate-engine.mjs) —
 * during which five workers polled a table without `available_at` ~7×/s.
 * Workers gate on this before their first poll; `limit 0` validates the
 * columns without reading a row.
 */
export async function isQueueSchemaReady() {
    try {
        await db.execute(sql `select \`available_at\`, \`locked_by\`, \`payload\`, \`max_attempts\` from \`queue_jobs\` limit 0`);
        return { ready: true };
    }
    catch (err) {
        return { ready: false, reason: describeDbError(err) };
    }
}
function summarize(data) {
    const { tenantId: _t, ...rest } = data;
    const summary = {};
    for (const [k, v] of Object.entries(rest)) {
        summary[k] = typeof v === "string" && v.length > 200 ? `${v.slice(0, 200)}…` : v;
    }
    return summary;
}
/** Insert a durable job row. Returns the new job id. */
async function enqueue(queueName, jobName, data, tenantId, opts) {
    const id = randomUUID();
    const availableAt = new Date(Date.now() + (opts?.delay ?? 0));
    await db.insert(queueJobs).values({
        id,
        tenantId,
        queueName,
        jobName,
        bullJobId: id, // self-reference; preserves the health-dashboard column
        status: "waiting",
        payloadSummary: summarize(data),
        payload: data,
        attempts: 0,
        maxAttempts: opts?.attempts ?? DEFAULT_ATTEMPTS,
        availableAt,
    });
    // A delayed job must not wake the loop early: it would poll, find nothing
    // eligible, and go back to sleep — harmless, but pointless.
    if (!opts?.delay)
        wake(queueName);
    return { id };
}
export const enqueueIntegrationJob = (data, opts) => enqueue(QUEUE_NAMES.integration, data.operation, data, data.tenantId, opts);
export const enqueueAiJob = (data, opts) => enqueue(QUEUE_NAMES.ai, data.jobType, data, data.tenantId, opts);
export const enqueueResearchJob = (data, opts) => enqueue(QUEUE_NAMES.research, data.operation, data, data.tenantId, opts);
export const enqueueNotificationJob = (data, opts) => enqueue(QUEUE_NAMES.notification, data.kind, data, data.tenantId, opts);
export const enqueueDomainEvent = (data, opts) => enqueue(QUEUE_NAMES.events, data.eventType, data, data.tenantId, opts);
/**
 * Atomically claim the next eligible job for any of the given queues.
 * SELECT … FOR UPDATE SKIP LOCKED guarantees no job is handed out twice even
 * if several poll loops race. Marks the row `active` and bumps `attempts`.
 */
export async function claimNextJob(queueNames, workerId) {
    return db.transaction(async (tx) => {
        const rows = await tx
            .select()
            .from(queueJobs)
            .where(and(inArray(queueJobs.queueName, queueNames), eq(queueJobs.status, "waiting"), lte(queueJobs.availableAt, new Date())))
            .orderBy(asc(queueJobs.availableAt), asc(queueJobs.enqueuedAt))
            .limit(1)
            .for("update", { skipLocked: true });
        const row = rows[0];
        if (!row)
            return null;
        const attemptsMade = row.attempts + 1;
        const startedAt = new Date();
        await tx
            .update(queueJobs)
            .set({ status: "active", attempts: attemptsMade, lockedAt: startedAt, lockedBy: workerId })
            .where(eq(queueJobs.id, row.id));
        return {
            id: row.id,
            name: row.jobName,
            data: (row.payload ?? {}),
            attemptsMade,
            processedOn: startedAt.getTime(),
        };
    });
}
/** Mark a claimed job completed. */
export async function completeJob(jobId, startedAtMs) {
    await db
        .update(queueJobs)
        .set({
        status: "completed",
        durationMs: Date.now() - startedAtMs,
        finishedAt: new Date(),
        error: null,
        lockedAt: null,
        lockedBy: null,
    })
        .where(eq(queueJobs.id, jobId));
}
/**
 * Mark a claimed job failed. If attempts remain, requeue it with exponential
 * backoff (5s · 2^attempt, capped at 5min); otherwise park it as failed.
 */
export async function failJob(job, startedAtMs, error) {
    const message = error instanceof Error ? error.message : String(error);
    const [row] = await db
        .select({ maxAttempts: queueJobs.maxAttempts })
        .from(queueJobs)
        .where(eq(queueJobs.id, job.id))
        .limit(1);
    const maxAttempts = row?.maxAttempts ?? DEFAULT_ATTEMPTS;
    if (job.attemptsMade < maxAttempts) {
        const backoff = Math.min(5_000 * 2 ** (job.attemptsMade - 1), 5 * 60_000);
        await db
            .update(queueJobs)
            .set({
            status: "waiting",
            error: message.slice(0, 2000),
            availableAt: new Date(Date.now() + backoff),
            durationMs: Date.now() - startedAtMs,
            lockedAt: null,
            lockedBy: null,
        })
            .where(eq(queueJobs.id, job.id));
    }
    else {
        await db
            .update(queueJobs)
            .set({
            status: "failed",
            error: message.slice(0, 2000),
            durationMs: Date.now() - startedAtMs,
            finishedAt: new Date(),
            lockedAt: null,
            lockedBy: null,
        })
            .where(eq(queueJobs.id, job.id));
    }
}
export function createPollWorker(queueName, processor, options) {
    const pollInterval = options?.pollIntervalMs ?? 1500;
    // Idle: an empty poll stretches the wait ×1.5 up to this ceiling; a job, or
    // a wake from enqueue(), snaps it back. Five queues × a 1.5 s fixed poll was
    // 200 BEGIN/SELECT … FOR UPDATE/COMMIT round-trips a minute on an idle host.
    const maxIdleInterval = options?.maxIdleIntervalMs ?? 15_000;
    // Failing: a claim that throws doubles the wait up to this ceiling, and the
    // failure is reported once, then at most once a minute. The same failing
    // poll repeated 40×/min per worker filled 6.7 GB of stderr on the host.
    const maxErrorBackoff = options?.maxErrorBackoffMs ?? 60_000;
    const workerId = `${queueName}:${randomUUID().slice(0, 8)}`;
    const listeners = {};
    let stopped = false;
    const emit = (event, ...args) => {
        for (const l of listeners[event] ?? [])
            l(...args);
    };
    async function loop() {
        let idleWait = pollInterval;
        let consecutiveErrors = 0;
        let lastErrorReportAt = 0;
        while (!stopped) {
            let job = null;
            try {
                job = await claimNextJob([queueName], workerId);
                if (consecutiveErrors > 0)
                    emit("recovered", consecutiveErrors);
                consecutiveErrors = 0;
            }
            catch (err) {
                consecutiveErrors++;
                const wait = Math.min(pollInterval * 2 ** Math.min(consecutiveErrors, 12), maxErrorBackoff);
                const now = Date.now();
                if (consecutiveErrors === 1 || now - lastErrorReportAt >= 60_000) {
                    lastErrorReportAt = now;
                    const reported = new Error(`claim failed ${consecutiveErrors}× in a row — ${describeDbError(err)} — next poll in ${Math.round(wait / 1000)}s`);
                    reported.cause = err;
                    emit("error", reported);
                }
                await sleepOrWake(queueName, wait);
                continue;
            }
            if (!job) {
                await sleepOrWake(queueName, idleWait);
                idleWait = Math.min(Math.round(idleWait * 1.5), maxIdleInterval);
                continue;
            }
            idleWait = pollInterval;
            const startedAt = job.processedOn ?? Date.now();
            try {
                await processor(job);
                await completeJob(job.id, startedAt);
                emit("completed", job);
            }
            catch (err) {
                await failJob(job, startedAt, err).catch(() => { });
                emit("failed", job, err);
            }
        }
    }
    void loop();
    return {
        on(event, listener) {
            (listeners[event] ??= []).push(listener);
            return this;
        },
        async close() {
            stopped = true;
        },
    };
}
/** Queue depth/health for the System Health Dashboard. */
export async function getQueueStats() {
    const rows = await db
        .select({
        queueName: queueJobs.queueName,
        status: queueJobs.status,
        count: sql `count(*)`,
    })
        .from(queueJobs)
        .groupBy(queueJobs.queueName, queueJobs.status);
    const stats = {};
    for (const name of Object.values(QUEUE_NAMES)) {
        stats[name] = { waiting: 0, active: 0, failed: 0, delayed: 0, completed: 0 };
    }
    for (const r of rows) {
        const bucket = (stats[r.queueName] ??= { waiting: 0, active: 0, failed: 0, delayed: 0, completed: 0 });
        const n = Number(r.count);
        if (r.status === "waiting")
            bucket.waiting += n;
        else if (r.status === "active")
            bucket.active += n;
        else if (r.status === "failed")
            bucket.failed += n;
        else if (r.status === "completed")
            bucket.completed += n;
    }
    return stats;
}
//# sourceMappingURL=queues.js.map