import { sql } from "drizzle-orm";
import { db } from "@growengine/db";

/**
 * Developer flags — the switches on the owner-only Developer console
 * (/admin/developer). Stored as one JSON object in the hub's SystemSetting
 * table under `developer.flags`, so a flip takes effect within seconds,
 * everywhere in the single process (web + in-process workers), with no
 * deploy and no restart.
 *
 * Read here rather than in the hub because the code that OBEYS most flags
 * lives in the engine: the AI provider, the poll loops, the scheduler. The
 * hub reads through the same function so both sides agree. A 15-second cache
 * keeps the cost at one tiny query per flag consumer per 15 s; the console
 * calls invalidateDevFlags() after a save so its own change is immediate.
 *
 * Every getter falls back to the defaults on a missing row, corrupt JSON, or
 * a database error — a flag must never be the reason something fails.
 */

export const DEV_FLAGS_SETTING_KEY = "developer.flags";

export const DEV_FLAG_DEFS = {
  "ai.enabled": {
    kind: "boolean",
    default: true,
    label: "AI features",
    help: "Master switch for every Claude/OpenAI call. Off: AI jobs are marked skipped instead of failing, and nothing is billed.",
  },
  "ai.model": {
    kind: "select",
    default: "",
    options: ["", "claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"],
    label: "Claude model override",
    help: "Empty = ANTHROPIC_MODEL from .grow.env (claude-opus-5 unless set). Sonnet 5 costs about 60% less.",
  },
  "maya.enabled": {
    kind: "boolean",
    default: true,
    label: "Maya can be invited to meetings",
    help: "Off: the Invite button refuses. A meeting she is already in keeps syncing.",
  },
  "mail.enabled": {
    kind: "boolean",
    default: true,
    label: "Outbound email",
    help: "Off: notifications keep queuing in the outbox and nothing is sent — nothing is lost.",
  },
  "workers.paused": {
    kind: "boolean",
    default: false,
    label: "Pause background workers",
    help: "The poll loops stay alive but claim no jobs; queued work waits.",
  },
  "scheduler.enabled": {
    kind: "boolean",
    default: true,
    label: "Scheduled jobs",
    help: "Integration syncs, token refresh, daily AI jobs and digests. Off: nothing is enqueued on a timer. Maya's meeting poll is unaffected.",
  },
  "maintenance.banner": {
    kind: "text",
    default: "",
    label: "Banner shown to everyone in the admin",
    help: "Empty = no banner. Use it for 'deploying at 18:00' or 'email is paused today'.",
  },
  "debug.logging": {
    kind: "boolean",
    default: false,
    label: "Verbose worker logging",
    help: "Logs every job claim, completion and failure to the runtime log.",
  },
} as const;

export type DevFlagKey = keyof typeof DEV_FLAG_DEFS;

export type DevFlags = {
  [K in DevFlagKey]: (typeof DEV_FLAG_DEFS)[K]["default"] extends boolean ? boolean : string;
};

export function defaultDevFlags(): DevFlags {
  const out = {} as Record<string, boolean | string>;
  for (const [key, def] of Object.entries(DEV_FLAG_DEFS)) out[key] = def.default;
  return out as DevFlags;
}

/** Merge a stored JSON payload over the defaults, ignoring anything malformed. */
export function parseDevFlags(raw: string | null | undefined): DevFlags {
  const flags = defaultDevFlags() as Record<string, boolean | string>;
  if (!raw) return flags as DevFlags;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return flags as DevFlags;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return flags as DevFlags;
  for (const [key, def] of Object.entries(DEV_FLAG_DEFS)) {
    const value = (parsed as Record<string, unknown>)[key];
    if (value === undefined) continue;
    if (def.kind === "boolean") {
      if (typeof value === "boolean") flags[key] = value;
    } else if (def.kind === "select") {
      if (typeof value === "string" && (def.options as readonly string[]).includes(value)) flags[key] = value;
    } else if (typeof value === "string") {
      flags[key] = value.slice(0, 500);
    }
  }
  return flags as DevFlags;
}

const CACHE_MS = 15_000;
let cached: { at: number; flags: DevFlags } | null = null;

export function invalidateDevFlags(): void {
  cached = null;
}

/** The current flags, cached for 15 s. Never throws. */
export async function getDevFlags(): Promise<DevFlags> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.flags;
  let raw: string | null = null;
  try {
    const result = await db.execute(
      sql`select \`value\` as value from \`SystemSetting\` where \`key\` = ${DEV_FLAGS_SETTING_KEY} limit 1`
    );
    // drizzle/mysql2 returns [rows, fields]; be tolerant of either shape.
    const rows = (Array.isArray(result) ? result[0] : result) as unknown;
    const first = Array.isArray(rows) ? (rows[0] as { value?: unknown } | undefined) : undefined;
    raw = typeof first?.value === "string" ? first.value : null;
  } catch {
    raw = null;
  }
  const flags = parseDevFlags(raw);
  cached = { at: Date.now(), flags };
  return flags;
}
