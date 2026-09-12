import { eq } from "drizzle-orm";
import { db, aiJobs } from "@growengine/db";
import { enqueueAiJob, type AiJobData } from "./queues.js";

/**
 * Create a tracked AI job: the ai_jobs row first, then the queue entry that
 * carries the row id, so status and cost link end to end. Lives here rather
 * than in the hub because the worker (Maya's meeting-ended path) needs it too.
 */
export async function createTrackedAiJob(
  tenantId: string,
  clientId: string | null,
  jobType: AiJobData["jobType"],
  input: Record<string, unknown>
) {
  const id = crypto.randomUUID();
  await db.insert(aiJobs).values({ id, tenantId, clientId, jobType, input, status: "queued" });
  const [row] = await db.select().from(aiJobs).where(eq(aiJobs.id, id));
  await enqueueAiJob({ tenantId, aiJobId: row.id, jobType, input });
  return row;
}
