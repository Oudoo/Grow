import { eq } from "drizzle-orm";
import { db, aiJobs } from "@growengine/db";
import { enqueueAiJob, type AiJobData } from "@growengine/core";

/**
 * Create a tracked AI job: insert the ai_jobs row first, then enqueue to
 * the AI worker with the row id so status/cost are linked end-to-end.
 */
export async function createAiJob(
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
