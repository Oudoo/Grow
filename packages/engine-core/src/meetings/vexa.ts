import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env.js";

/**
 * Maya's way into a meeting: a Vexa bot.
 *
 * Vexa (github.com/vexa-ai/vexa, Apache-2.0) runs a headless participant that
 * joins Google Meet and Microsoft Teams calls under a display name, transcribes
 * with speaker attribution, and exposes the transcript over REST. The hosted
 * service (api.cloud.vexa.ai) and a self-hosted deployment speak the same API,
 * so this client only needs VEXA_API_URL + VEXA_API_KEY — nothing here cares
 * which one is behind them. Docs: docs.vexa.ai/api/meetings.md.
 *
 * Two rules:
 *  - A meeting is addressed by (platform, native_meeting_id): the Meet code
 *    `abc-defg-hij`, or the numeric Teams meeting id printed beside a
 *    passcode in the invite. We never store or send anything else about the
 *    call.
 *  - The bot must be ADMITTED by a human in the call (Meet's "someone wants
 *    to join"). Until then Vexa reports `awaiting_admission`; the meeting page
 *    shows that state instead of pretending Maya is listening.
 */

export type MeetingPlatform = "google_meet" | "teams";

export interface ParsedMeetingLink {
  platform: MeetingPlatform;
  nativeMeetingId: string;
  passcode?: string;
}

/**
 * Turn what a person pastes into a Vexa meeting address. Accepts:
 *  - a Google Meet link or bare code           https://meet.google.com/abc-defg-hij
 *  - a Teams "meet" link with passcode          https://teams.live.com/meet/9349127043183?p=Ab12Cd
 *  - the invite text "Meeting ID: 234 567 890 12  Passcode: aBcD"
 * Returns null for anything else — including the long `/l/meetup-join/…`
 * Teams links, which do not carry the numeric id Vexa needs; the UI then asks
 * for the id + passcode from the invite instead of guessing.
 */
export function parseMeetingLink(input: string): ParsedMeetingLink | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  const meet = /(?:^|meet\.google\.com\/)([a-z]{3}-[a-z]{4}-[a-z]{3})(?=$|[/?#\s])/i.exec(raw);
  if (meet) return { platform: "google_meet", nativeMeetingId: meet[1].toLowerCase() };

  const teamsMeet = /teams\.(?:live|microsoft)\.com\/meet\/(\d{9,16})(?:[/?][^#\s]*?\bp=([A-Za-z0-9]+))?/i.exec(raw);
  if (teamsMeet) {
    return { platform: "teams", nativeMeetingId: teamsMeet[1], ...(teamsMeet[2] ? { passcode: teamsMeet[2] } : {}) };
  }

  const invite = /(?:meeting\s*id\s*[:#]?\s*)?((?:\d[\d ]{8,20}\d))(?:[\s,]*(?:passcode|pass\s*code|code|p)\s*[:#]?\s*([A-Za-z0-9]{3,32}))?\s*$/i.exec(raw);
  if (invite) {
    const id = invite[1].replace(/\s+/g, "");
    if (/^\d{9,16}$/.test(id) && !/meet\.google\.com|https?:\/\//i.test(raw)) {
      return { platform: "teams", nativeMeetingId: id, ...(invite[2] ? { passcode: invite[2] } : {}) };
    }
  }
  return null;
}

/** Bot statuses Vexa reports while the call is still going. */
export const LIVE_BOT_STATUSES = new Set([
  "requested",
  "joining",
  "awaiting_admission",
  "needs_help",
  "active",
  "stopping",
]);

export function isMayaConfigured(): boolean {
  return Boolean(env.vexaApiKey);
}

function vexa() {
  if (!env.vexaApiKey) throw new Error("VEXA_API_KEY is not configured — Maya cannot join meetings");
  return { base: env.vexaApiUrl.replace(/\/+$/, ""), key: env.vexaApiKey };
}

async function vexaRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { base, key } = vexa();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "X-API-Key": key, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Vexa ${init.method ?? "GET"} ${path} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export interface VexaSegment {
  segment_id?: string;
  speaker?: string | null;
  text: string;
  start: number;
  end: number;
  language?: string | null;
  completed?: boolean;
  confidence?: number;
}

export interface VexaTranscript {
  id?: number | string;
  platform?: string;
  native_meeting_id?: string;
  status?: string;
  start_time?: string | null;
  end_time?: string | null;
  segments?: VexaSegment[];
}

/** POST /bots — ask Vexa to send a participant named after Maya into the call. */
export async function sendMayaToMeeting(
  link: ParsedMeetingLink,
  opts: { botName?: string; language?: string } = {}
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {
    platform: link.platform,
    native_meeting_id: link.nativeMeetingId,
    bot_name: opts.botName ?? env.mayaBotName,
  };
  if (link.passcode) body.passcode = link.passcode;
  const language = opts.language ?? env.mayaLanguage;
  if (language) body.language = language; // omitted = Vexa auto-detects per window
  return vexaRequest("/bots", { method: "POST", body: JSON.stringify(body) });
}

/** GET /transcripts/{platform}/{id} — the meeting record plus every segment so far. */
export async function fetchVexaTranscript(platform: MeetingPlatform, nativeMeetingId: string): Promise<VexaTranscript> {
  return vexaRequest(`/transcripts/${platform}/${encodeURIComponent(nativeMeetingId)}`);
}

/** DELETE /bots/{platform}/{id} — Maya leaves; Vexa finalises the transcript. */
export async function stopMayaBot(platform: MeetingPlatform, nativeMeetingId: string): Promise<Record<string, unknown>> {
  return vexaRequest(`/bots/${platform}/${encodeURIComponent(nativeMeetingId)}`, { method: "DELETE" });
}

/** Register (or clear) the account-level webhook Vexa calls when a meeting completes. */
export async function setVexaWebhook(url: string, secret: string): Promise<Record<string, unknown>> {
  return vexaRequest("/user/webhook", {
    method: "PUT",
    body: JSON.stringify({
      webhook_url: url,
      webhook_secret: secret,
      webhook_events: { "meeting.completed": true, "bot.failed": true, "meeting.started": true },
    }),
  });
}

/**
 * Vexa signs deliveries as sha256=HMAC(secret, "<timestamp>.<raw body>").
 * Constant-time compare; a missing header is a failed verification, not a
 * pass-through.
 */
export function verifyVexaSignature(
  rawBody: string,
  timestamp: string | null | undefined,
  signature: string | null | undefined,
  secret: string
): boolean {
  if (!timestamp || !signature || !secret) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The shape the engine's `transcripts.segments` column has always held. */
export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  /** Vexa may still be revising an interim segment. */
  interim?: boolean;
}

export function normalizeVexaSegments(segments: VexaSegment[] | undefined | null): TranscriptSegment[] {
  return (segments ?? [])
    .filter((s) => typeof s?.text === "string" && s.text.trim())
    .map((s) => ({
      start: Number(s.start) || 0,
      end: Number(s.end) || Number(s.start) || 0,
      text: s.text.trim(),
      ...(s.speaker ? { speaker: String(s.speaker) } : {}),
      ...(s.completed === false ? { interim: true } : {}),
    }))
    .sort((a, b) => a.start - b.start);
}

export type MayaNoteKind = "note" | "action" | "decision" | "document" | "summary";

export interface MayaLiveNote {
  /** Seconds into the meeting. */
  at: number;
  speaker: string | null;
  kind: MayaNoteKind;
  /** What was said after Maya's name. */
  text: string;
}

const KIND_RULES: [MayaNoteKind, RegExp][] = [
  ["action", /\b(action item|to-?do|task|assign|follow[- ]?up|remind|deadline|by (?:monday|tuesday|wednesday|thursday|friday|next week|tomorrow))\b/i],
  ["decision", /\b(decid\w*|decision|agreed?|we agree|approved?|final(?:ise|ize)d?)\b/i],
  ["document", /\b(prepare|draft|write up|send (?:them|the client|over)|share|document|proposal|sow|scope|report|deck|presentation|brief|quotation|quote|invoice|contract)\b/i],
  ["summary", /\b(summar\w*|recap|wrap[- ]?up)\b/i],
];

/**
 * "Maya, note that the client wants the launch before Ramadan." — find every
 * utterance addressed to the bot and classify what it asked for. Pure, so the
 * meeting page and the worker agree on it and it can be unit-tested without a
 * call. Interim (still-revising) segments are skipped: a half-heard sentence
 * is worse than a late one.
 */
export function extractMayaCommands(segments: TranscriptSegment[], botName = "Maya"): MayaLiveNote[] {
  const name = botName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const addressed = new RegExp(`(?:^|[\\s,.;:!?"'(-])${name}\\b[\\s,:;!?.-]*(.*)$`, "is");
  const notes: MayaLiveNote[] = [];
  const seen = new Set<string>();
  for (const s of segments) {
    if (s.interim) continue;
    const m = addressed.exec(s.text);
    if (!m) continue;
    const rest = (m[1] ?? "").trim();
    // "Thanks, Maya." carries nothing to record.
    const text = rest.split(/\s+/).filter(Boolean).length >= 3 ? rest : s.text.trim();
    if (text.split(/\s+/).length < 3) continue;
    const key = `${Math.round(s.start)}|${text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const kind = KIND_RULES.find(([, re]) => re.test(text))?.[0] ?? "note";
    notes.push({ at: s.start, speaker: s.speaker ?? null, kind, text });
  }
  return notes;
}

/**
 * MariaDB hands `json()` columns back as strings (see the hub's
 * lib/engine/json.ts for the incident). Everything in the engine that reads a
 * JSON column it also writes goes through this.
 */
export function jsonArrayFrom<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}
