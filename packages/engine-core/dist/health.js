import { sql as dsql } from "drizzle-orm";
import { db } from "@growengine/db";
import { redis } from "./redis.js";
import { getQueueStats } from "./queues.js";
const WORKER_NAMES = ["integration", "ai", "research", "notification", "events"];
export async function getSystemHealth() {
    const dbStart = Date.now();
    let dbOk = true;
    try {
        await db.execute(dsql `SELECT 1`);
    }
    catch {
        dbOk = false;
    }
    const dbLatency = Date.now() - dbStart;
    const redisStart = Date.now();
    let redisOk = true;
    try {
        await redis.ping();
    }
    catch {
        redisOk = false;
    }
    const redisLatency = Date.now() - redisStart;
    let queues = {};
    try {
        queues = await getQueueStats();
    }
    catch {
        /* queue stats unavailable when redis is down */
    }
    const workers = [];
    for (const name of WORKER_NAMES) {
        let lastHeartbeat = null;
        try {
            lastHeartbeat = await redis.get(`worker:heartbeat:${name}`);
        }
        catch {
            /* redis down */
        }
        const healthy = !!lastHeartbeat && Date.now() - new Date(lastHeartbeat).getTime() < 120_000;
        workers.push({ name, lastHeartbeat, healthy });
    }
    return {
        database: { ok: dbOk, latencyMs: dbLatency },
        redis: { ok: redisOk, latencyMs: redisLatency },
        queues,
        workers,
        checkedAt: new Date().toISOString(),
    };
}
/** Workers call this every 30s. */
export async function recordHeartbeat(workerName) {
    await redis.set(`worker:heartbeat:${workerName}`, new Date().toISOString(), "EX", 300);
}
//# sourceMappingURL=health.js.map