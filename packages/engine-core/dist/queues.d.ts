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
export declare const QUEUE_NAMES: {
    readonly integration: "integration";
    readonly ai: "ai";
    readonly research: "research";
    readonly notification: "notification";
    readonly events: "events";
};
export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export interface IntegrationJobData {
    tenantId: string;
    integrationId: string;
    operation: "sync" | "refresh_token" | "health_check" | "backfill";
    options?: {
        since?: string;
        until?: string;
    };
}
export interface AiJobData {
    tenantId: string;
    aiJobId: string;
    jobType: "report" | "dmaic" | "aeo_audit" | "meeting_analysis" | "sow" | "recommendation_verify" | "forecast" | "embedding" | "lead_audit" | "qbr" | "digest" | "lost_opportunity" | "seasonality" | "process_intelligence" | "health_score" | "scorecards" | "retention_enforcement";
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
/** The shape the in-app worker processors receive (BullMQ-`Job`-compatible). */
export interface QueueJob<T = Record<string, unknown>> {
    id: string;
    name: string;
    data: T;
    attemptsMade: number;
    processedOn: number | null;
}
export declare const enqueueIntegrationJob: (data: IntegrationJobData, opts?: JobOptions) => Promise<{
    id: string;
}>;
export declare const enqueueAiJob: (data: AiJobData, opts?: JobOptions) => Promise<{
    id: string;
}>;
export declare const enqueueResearchJob: (data: ResearchJobData, opts?: JobOptions) => Promise<{
    id: string;
}>;
export declare const enqueueNotificationJob: (data: NotificationJobData, opts?: JobOptions) => Promise<{
    id: string;
}>;
export declare const enqueueDomainEvent: (data: DomainEventJobData, opts?: JobOptions) => Promise<{
    id: string;
}>;
/**
 * Atomically claim the next eligible job for any of the given queues.
 * SELECT … FOR UPDATE SKIP LOCKED guarantees no job is handed out twice even
 * if several poll loops race. Marks the row `active` and bumps `attempts`.
 */
export declare function claimNextJob(queueNames: readonly QueueName[], workerId: string): Promise<QueueJob | null>;
/** Mark a claimed job completed. */
export declare function completeJob(jobId: string, startedAtMs: number): Promise<void>;
/**
 * Mark a claimed job failed. If attempts remain, requeue it with exponential
 * backoff (5s · 2^attempt, capped at 5min); otherwise park it as failed.
 */
export declare function failJob(job: QueueJob, startedAtMs: number, error: unknown): Promise<void>;
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
export declare function createPollWorker<T = Record<string, unknown>>(queueName: QueueName, processor: JobProcessor<T>, options?: {
    pollIntervalMs?: number;
}): PollWorker;
/** Queue depth/health for the System Health Dashboard. */
export declare function getQueueStats(): Promise<Record<string, {
    waiting: number;
    active: number;
    failed: number;
    delayed: number;
    completed: number;
}>>;
//# sourceMappingURL=queues.d.ts.map