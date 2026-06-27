/**
 * Next.js instrumentation — runs once when the server process boots.
 *
 * We start the Grow Engine's background workers IN-PROCESS here (only on the
 * Node.js runtime, never Edge), so all heavy processing drains the MySQL job
 * queue inside the single unified server. A failure in a worker loop is caught
 * and logged; it can never take the web server down.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL) {
    console.warn("[instrumentation] DATABASE_URL not set — skipping in-process workers.");
    return;
  }
  try {
    const { startInProcessWorkers } = await import("@growengine/worker");
    startInProcessWorkers();
  } catch (err) {
    console.error("[instrumentation] failed to start in-process workers:", err);
  }
}
