import type { SystemStatus } from "./SystemConsole";

/**
 * Probe an integrated Grow system's health endpoint from the server side
 * (avoids CORS and keeps internal URLs out of the client when they differ).
 * Falls back to a plain root-page probe when /api/health does not exist.
 */
export async function probeSystem(baseUrl: string): Promise<SystemStatus> {
  const probe = async (path: string) => {
    const res = await fetch(`${baseUrl}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res;
  };

  try {
    const res = await probe("/api/health");
    if (res.ok) {
      let detail = "Health endpoint responding.";
      try {
        const body = (await res.json()) as Record<string, unknown>;
        const status = typeof body.status === "string" ? body.status : "ok";
        const extras = Object.entries(body)
          .filter(([k, v]) => k !== "status" && (typeof v === "string" || typeof v === "number" || typeof v === "boolean"))
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join(", ");
        detail = `status: ${status}${extras ? ` — ${extras}` : ""}`;
      } catch {
        // non-JSON health body is still a healthy signal
      }
      return { healthy: true, detail };
    }
    // health route exists but reports a problem
    return { healthy: false, detail: `Health endpoint returned HTTP ${res.status}.` };
  } catch {
    // no health route or service down — try the root page before declaring it dead
    try {
      const res = await probe("/");
      if (res.ok || res.status === 307 || res.status === 302) {
        return { healthy: true, detail: "Service responding (no dedicated health endpoint)." };
      }
      return { healthy: false, detail: `Root probe returned HTTP ${res.status}.` };
    } catch {
      return { healthy: null, detail: "No response — service appears to be offline." };
    }
  }
}
