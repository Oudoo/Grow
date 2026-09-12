import { isQueueSchemaReady, recordHeartbeat } from "@growengine/core";
import { createIntegrationWorker } from "./workers/integration.js";
import { createAiWorker } from "./workers/ai/index.js";
import { createResearchWorker } from "./workers/research.js";
import { createNotificationWorker } from "./workers/notification.js";
import { createEventsWorker } from "./workers/events.js";
import { startScheduler } from "./scheduler.js";
const SCHEMA_RETRY_MS = 30_000;
export function startInProcessWorkers() {
    if (globalThis.__growengine_workers_started)
        return;
    globalThis.__growengine_workers_started = true;
    void startWhenSchemaReady();
}
async function startWhenSchemaReady() {
    for (let attempt = 1;; attempt++) {
        const probe = await isQueueSchemaReady();
        if (probe.ready) {
            if (attempt > 1)
                console.log(`[worker] queue schema ready after ${attempt} checks — starting.`);
            break;
        }
        // First miss immediately, then once every ten checks (five minutes).
        if (attempt === 1 || attempt % 10 === 0) {
            console.log(`[worker] queue schema not ready (${probe.reason}) — workers idle; re-checking every ${SCHEMA_RETRY_MS / 1000}s (check ${attempt}). ` +
                `If this persists after boot, read the [migrate-engine] lines above or run scripts/migrate-engine.mjs by hand.`);
        }
        await new Promise((r) => setTimeout(r, SCHEMA_RETRY_MS));
    }
    const workers = [
        { name: "integration", worker: createIntegrationWorker() },
        { name: "ai", worker: createAiWorker() },
        { name: "research", worker: createResearchWorker() },
        { name: "notification", worker: createNotificationWorker() },
        { name: "events", worker: createEventsWorker() },
    ];
    for (const { name, worker } of workers) {
        // The message already carries the database's own error and the backoff
        // (see createPollWorker); the stack would only add bundled chunk paths.
        worker.on("error", (err) => console.error(`[worker:${name}] ${err.message}`));
        worker.on("recovered", (failures) => console.log(`[worker:${name}] recovered after ${failures} failed poll(s).`));
        console.log(`[worker:${name}] started (in-process)`);
    }
    // Heartbeats for the System Health Dashboard.
    setInterval(() => {
        for (const { name } of workers)
            recordHeartbeat(name).catch(() => { });
    }, 30_000);
    for (const { name } of workers)
        recordHeartbeat(name).catch(() => { });
    startScheduler();
    console.log("[scheduler] started (in-process)");
    console.log("Grow Engine in-process workers are running.");
}
//# sourceMappingURL=start.js.map