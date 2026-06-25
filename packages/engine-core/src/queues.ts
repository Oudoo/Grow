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
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface IntegrationJobData {
  tenantId: string;
  integrationId: string;
  operation: "sync" | "refresh_token" | "health_check" | "backfill";
  options?: { since?: string; until?: string };
}

export interface AiJobData {
  tenantId: string;
  aiJobId: string;
  jobType:
    | "report"
    | "dmaic"
    | "aeo_audit"
    | "meeting_analysis"
    | "sow"
    | "recommendation_verify"
    | "forecast"
    | "embedding"
    | "lead_audit"
    | "qbr"
    | "digest"
    | "lost_opportunity"
    | "seasonality"
    | "process_intelligence"
    | "health_score"
    | "scorecards"
    | "retention_enforcement";
  input: Record<string, unknown>;
}

export interface ResearchJobData {
  tenantId: string;
  clientId?: string;
  operation: "competitor_analysis" | "web_crawl" | "pr_mentions" | "rss_monitor";
  input: Record<string, unknown>;
}

export interface NotificationJobData {
  tenantId: string;
  notificationId?: string;
  kind: "dispatch" | "digest_weekly" | "digest_monthly" | "onboarding_drip" | "webhook_delivery";
  input: Record<string, unknown>;
}

export interface DomainEventJobData {
  domainEventId: string;
  tenantId: string | null;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface JobOptions {
  /** Retry budget before the job is parked as failed. */
  attempts?: number;
  /** Delay before the job first becomes eligible (ms). */
  delay?: number;
}

const DEFAULT_ATTEMPTS = 3;

/** The shape the in-app worker processors receive (BullMQ-`Job`-compatible). */
export interface QueueJob<T = Record<string, unknown>> {
  id: string;
  name: string;
  data: T;
  attemptsMade: number;
  processedOn: number | null;
}

function summarize(data: Record<string, unknown>) {
  const { tenantId: _t, ...rest } = data;
  const summary: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    summary[k] = typeof v === "string" && v.length > 200 ? `${v.slice(0, 200)}…` : v;
  }
  return summary;
}

/** Insert a durable job row. Returns the new job id. */
async function enqueue(
  queueName: QueueName,
  jobName: string,
  data: Record<string, unknown>,
  tenantId: string | null,
  opts?: JobOptions
): Promise<{ id: string }> {
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
  return { id };
}

export const enqueueIntegrationJob = (data: IntegrationJobData, opts?: JobOptions) =>
  enqueue(QUEUE_NAMES.integration, data.operation, data as unknown as Record<string, unknown>, data.tenantId, opts);

export const enqueueAiJob = (data: AiJobData, opts?: JobOptions) =>
  enqueue(QUEUE_NAMES.ai, data.jobType, data as unknown as Record<string, unknown>, data.tenantId, opts);

export const enqueueResearchJob = (data: ResearchJobData, opts?: JobOptions) =>
  enqueue(QUEUE_NAMES.research, data.operation, data as unknown as Record<string, unknown>, data.tenantId, opts);

export const enqueueNotificationJob = (data: NotificationJobData, opts?: JobOptions) =>
  enqueue(QUEUE_NAMES.notification, data.kind, data as unknown as Record<string, unknown>, data.tenantId, opts);

export const enqueueDomainEvent = (data: DomainEventJobData, opts?: JobOptions) =>
  enqueue(QUEUE_NAMES.events, data.eventType, data as unknown as Record<string, unknown>, data.tenantId, opts);

/**
 * Atomically claim the next eligible job for any of the given queues.
 * SELECT … FOR UPDATE SKIP LOCKED guarantees no job is handed out twice even
 * if several poll loops race. Marks the row `active` and bumps `attempts`.
 */
export async function claimNextJob(
  queueNames: readonly QueueName[],
  workerId: string
): Promise<QueueJob | null> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(queueJobs)
      .where(
        and(
          inArray(queueJobs.queueName, queueNames as QueueName[]),
          eq(queueJobs.status, "waiting"),
          lte(queueJobs.availableAt, new Date())
        )
      )
      .orderBy(asc(queueJobs.availableAt), asc(queueJobs.enqueuedAt))
      .limit(1)
      .for("update", { skipLocked: true });

    const row = rows[0];
    if (!row) return null;

    const attemptsMade = row.attempts + 1;
    const startedAt = new Date();
    await tx
      .update(queueJobs)
      .set({ status: "active", attempts: attemptsMade, lockedAt: startedAt, lockedBy: workerId })
      .where(eq(queueJobs.id, row.id));

    return {
      id: row.id,
      name: row.jobName,
      data: (row.payload ?? {}) as Record<string, unknown>,
      attemptsMade,
      processedOn: startedAt.getTime(),
    };
  });
}

/** Mark a claimed job completed. */
export async function completeJob(jobId: string, startedAtMs: number) {
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
export async function failJob(job: QueueJob, startedAtMs: number, error: unknown) {
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
  } else {
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

export type JobProcessor<T = Record<string, unknown>> = (job: QueueJob<T>) => Promise<unknown>;

/**
 * In-process poll worker. BullMQ-`Worker`-compatible surface (`.on`/`.close`)
 * so existing worker modules change only their constructor call. Each loop
 * claims one job for its queue, runs the processor, and records the outcome.
 */
export interface PollWorker {
  on(event: "error" | "completed" | "failed", listener: (...args: unknown[]) => void): PollWorker;
  close(): Promise<void>;
}

export function createPollWorker<T = Record<string, unknown>>(
  queueName: QueueName,
  processor: JobProcessor<T>,
  options?: { pollIntervalMs?: number }
): PollWorker {
  const pollInterval = options?.pollIntervalMs ?? 1500;
  const workerId = `${queueName}:${randomUUID().slice(0, 8)}`;
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  let stopped = false;

  const emit = (event: string, ...args: unknown[]) => {
    for (const l of listeners[event] ?? []) l(...args);
  };

  async function loop() {
    while (!stopped) {
      let job: QueueJob | null = null;
      try {
        job = await claimNextJob([queueName], workerId);
      } catch (err) {
        emit("error", err);
      }
      if (!job) {
        await new Promise((r) => setTimeout(r, pollInterval));
        continue;
      }
      const startedAt = job.processedOn ?? Date.now();
      try {
        await processor(job as QueueJob<T>);
        await completeJob(job.id, startedAt);
        emit("completed", job);
      } catch (err) {
        await failJob(job, startedAt, err).catch(() => {});
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
      count: sql<number>`count(*)`,
    })
    .from(queueJobs)
    .groupBy(queueJobs.queueName, queueJobs.status);

  const stats: Record<string, { waiting: number; active: number; failed: number; delayed: number; completed: number }> = {};
  for (const name of Object.values(QUEUE_NAMES)) {
    stats[name] = { waiting: 0, active: 0, failed: 0, delayed: 0, completed: 0 };
  }
  for (const r of rows) {
    const bucket = (stats[r.queueName] ??= { waiting: 0, active: 0, failed: 0, delayed: 0, completed: 0 });
    const n = Number(r.count);
    if (r.status === "waiting") bucket.waiting += n;
    else if (r.status === "active") bucket.active += n;
    else if (r.status === "failed") bucket.failed += n;
    else if (r.status === "completed") bucket.completed += n;
  }
  return stats;
}
