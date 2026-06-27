import { recordHeartbeat } from "@growengine/core";
import { createIntegrationWorker } from "./workers/integration.js";
import { createAiWorker } from "./workers/ai/index.js";
import { createResearchWorker } from "./workers/research.js";
import { createNotificationWorker } from "./workers/notification.js";
import { createEventsWorker } from "./workers/events.js";
import { startScheduler } from "./scheduler.js";

/**
 * In-process worker entry for the unified Grow app. Started from the host's
 * `instrumentation.ts` so all background processing (AI, syncs, crawling,
 * notifications, events, scheduling) runs inside the single Next.js server —
 * no separate worker service, no broker. Idempotent: guarded so Next's
 * double-invocation of instrumentation never starts two sets of loops.
 */

declare global {
  // eslint-disable-next-line no-var
  var __growengine_workers_started: boolean | undefined;
}

export function startInProcessWorkers(): void {
  if (globalThis.__growengine_workers_started) return;
  globalThis.__growengine_workers_started = true;

  const workers = [
    { name: "integration", worker: createIntegrationWorker() },
    { name: "ai", worker: createAiWorker() },
    { name: "research", worker: createResearchWorker() },
    { name: "notification", worker: createNotificationWorker() },
    { name: "events", worker: createEventsWorker() },
  ];

  for (const { name, worker } of workers) {
    worker.on("error", (err) => console.error(`[worker:${name}] error`, err));
    console.log(`[worker:${name}] started (in-process)`);
  }

  // Heartbeats for the System Health Dashboard.
  setInterval(() => {
    for (const { name } of workers) recordHeartbeat(name).catch(() => {});
  }, 30_000);
  for (const { name } of workers) recordHeartbeat(name).catch(() => {});

  startScheduler();
  console.log("[scheduler] started (in-process)");
  console.log("Grow Engine in-process workers are running.");
}
