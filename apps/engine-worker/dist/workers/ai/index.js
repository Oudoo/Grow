import { eq } from "drizzle-orm";
import { db, aiJobs } from "@growengine/db";
import { AiDisabledError, createPollWorker, QUEUE_NAMES } from "@growengine/core";
import { markJobStatus } from "../../lib/track.js";
import { handleForecast, handleSeasonality, handleLostOpportunity, handleHealthScore, handleScorecards, } from "./quant.js";
import { handleMeetingAnalysis, handleMeetingDocuments, handleSowGeneration, handleRecommendationVerify, handleDmaicGeneration, handleReport, } from "./analysis.js";
import { handleLeadAudit, handleDigest, handleQbr, handleProcessIntelligence, } from "./reports.js";
import { handleAeoAudit } from "./aeo.js";
import { handleEmbedding, handleRetentionEnforcement } from "./maintenance.js";
/**
 * AI Worker — reports, DMAIC formulation, AEO/GEO audits, meeting
 * analysis, verification, forecasting, digests and maintenance. Each job
 * is tracked end-to-end in ai_jobs with cost linkage via cost_tracking.
 */
const handlers = {
    report: handleReport,
    dmaic: handleDmaicGeneration,
    aeo_audit: handleAeoAudit,
    meeting_analysis: handleMeetingAnalysis,
    meeting_documents: handleMeetingDocuments,
    sow: handleSowGeneration,
    recommendation_verify: handleRecommendationVerify,
    forecast: handleForecast,
    embedding: handleEmbedding,
    lead_audit: handleLeadAudit,
    qbr: handleQbr,
    digest: handleDigest,
    lost_opportunity: handleLostOpportunity,
    seasonality: handleSeasonality,
    process_intelligence: handleProcessIntelligence,
    health_score: handleHealthScore,
    scorecards: handleScorecards,
    retention_enforcement: handleRetentionEnforcement,
};
export function createAiWorker() {
    return createPollWorker(QUEUE_NAMES.ai, async (job) => {
        await markJobStatus(job, "active");
        const { aiJobId, jobType } = job.data;
        if (aiJobId) {
            await db
                .update(aiJobs)
                .set({
                status: "running",
                queueJobId: String(job.id),
                attempts: job.attemptsMade + 1,
                startedAt: new Date(),
            })
                .where(eq(aiJobs.id, aiJobId));
        }
        try {
            const handler = handlers[jobType];
            if (!handler)
                throw new Error(`Unknown AI job type: ${jobType}`);
            const output = await handler(job.data);
            if (aiJobId) {
                await db
                    .update(aiJobs)
                    .set({
                    status: "completed",
                    output: output ?? {},
                    completedAt: new Date(),
                })
                    .where(eq(aiJobs.id, aiJobId));
            }
            return output;
        }
        catch (err) {
            // AI switched off in the Developer console: not a failure, and not
            // worth three retries. Park the job as skipped and let the queue row
            // complete; re-queue from the console when AI is back on.
            if (err instanceof AiDisabledError || err.code === "AI_DISABLED") {
                if (aiJobId) {
                    await db
                        .update(aiJobs)
                        .set({ status: "skipped", error: err.message, completedAt: new Date() })
                        .where(eq(aiJobs.id, aiJobId));
                }
                return { skipped: true };
            }
            if (aiJobId) {
                await db
                    .update(aiJobs)
                    .set({ status: "failed", error: err.message })
                    .where(eq(aiJobs.id, aiJobId));
            }
            throw err;
        }
    });
}
//# sourceMappingURL=index.js.map