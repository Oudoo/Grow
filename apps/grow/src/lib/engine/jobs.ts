/**
 * Create a tracked AI job. The implementation moved to @growengine/core on
 * 2026-09-12 so the worker (Maya's meeting-ended hand-off) can use it too;
 * this re-export keeps every existing import in the hub working unchanged.
 */
export { createTrackedAiJob as createAiJob } from "@growengine/core";
