import { findMeetingByBot, pollMayaMeetings, syncMayaMeeting, verifyVexaSignature } from "@growengine/core";

/**
 * Vexa → GROW: "a meeting Maya was in has changed state".
 *
 * Registered once per Vexa account (see DEPLOYMENT.md, "Maya"). Deliveries are
 * signed as sha256=HMAC(secret, "<timestamp>.<body>"); an unsigned or badly
 * signed request is rejected before the body is even parsed, and a signature
 * older than five minutes is treated as a replay.
 *
 * The payload's exact shape is not documented beyond `event_type` and a
 * `meeting_id`, so this looks for a (platform, native_meeting_id) pair anywhere
 * sensible and, failing that, simply syncs every live meeting — the worker's
 * 20-second poll does the same, so the worst case is "no faster than polling".
 */
export const dynamic = "force-dynamic";

const MAX_SKEW_SECONDS = 5 * 60;

function findMeetingRef(payload: unknown): { platform: string; nativeMeetingId: string } | null {
  const candidates: unknown[] = [payload];
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    for (const key of ["meeting", "data", "payload", "object"]) if (p[key]) candidates.push(p[key]);
  }
  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    const platform = o.platform;
    const id = o.native_meeting_id ?? o.nativeMeetingId;
    if (typeof platform === "string" && typeof id === "string" && platform && id) {
      return { platform, nativeMeetingId: id };
    }
  }
  return null;
}

export async function POST(request: Request) {
  const secret = process.env.VEXA_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "VEXA_WEBHOOK_SECRET is not configured" }, { status: 503 });
  }
  const raw = await request.text();
  const timestamp = request.headers.get("x-webhook-timestamp");
  const signature = request.headers.get("x-webhook-signature");
  if (!verifyVexaSignature(raw, timestamp, signature, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_SKEW_SECONDS) {
    return Response.json({ error: "Stale signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ref = findMeetingRef(payload);
  let synced = 0;
  try {
    if (ref) {
      const meeting = await findMeetingByBot(ref.platform, ref.nativeMeetingId);
      if (meeting) {
        await syncMayaMeeting(meeting);
        synced = 1;
      }
    } else {
      synced = await pollMayaMeetings();
    }
  } catch (err) {
    // Acknowledge anyway: Vexa would retry, and the poll loop covers it.
    console.error("[maya] webhook sync failed:", (err as Error).message);
  }
  const eventType = payload && typeof payload === "object" ? (payload as { event_type?: string }).event_type ?? null : null;
  return Response.json({ ok: true, event: eventType, synced }, { headers: { "Cache-Control": "no-store" } });
}
