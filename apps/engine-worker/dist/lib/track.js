import { eq } from "drizzle-orm";
import { db, queueJobs } from "@growengine/db";
/**
 * Mirror job lifecycle into queue_jobs for the health dashboard. The poll
 * worker already records active/completed/failed around each job; handlers
 * may still call this to surface mid-flight status (e.g. partial progress).
 */
export async function markJobStatus(job, status, error) {
    try {
        const finished = status === "completed" || status === "failed";
        await db
            .update(queueJobs)
            .set({
            status,
            error: error ?? null,
            attempts: job.attemptsMade,
            durationMs: job.processedOn ? Date.now() - job.processedOn : null,
            finishedAt: finished ? new Date() : null,
        })
            .where(eq(queueJobs.bullJobId, String(job.id)));
    }
    catch {
        /* tracking must never break job processing */
    }
}
//# sourceMappingURL=track.js.map