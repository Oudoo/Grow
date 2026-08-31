/**
 * Admin-editable configuration: types, defaults, and validation.
 *
 * Pure and dependency-free, so client components can render from it and the
 * server can validate against it with one definition. The stored values live in
 * the SystemSetting table; reading and writing them is lib/settings.ts
 * (server-only).
 *
 * A missing setting means "use the default below". That is what keeps this
 * change invisible on first deploy — the defaults reproduce exactly the
 * hardcoded lists they replaced.
 */

/**
 * Colours an admin may choose. Deliberately a closed set: Tailwind only emits
 * classes it can see at build time, so a free-text colour would silently render
 * unstyled. It also stops arbitrary class strings reaching the markup.
 */
export const CONFIG_COLORS = ["slate", "blue", "green", "amber", "red", "violet", "cyan"] as const;
export type ConfigColor = (typeof CONFIG_COLORS)[number];

/** Badge classes per colour — written out in full so Tailwind keeps them. */
export const COLOR_BADGE: Record<ConfigColor, string> = {
  slate: "bg-fg/5 text-slate border-fg/10",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  green: "bg-green-500/15 text-green-400 border-green-500/30",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  cyan: "bg-cyan/15 text-cyan border-cyan/30",
};

/** Dot/accent colour, for column headers. */
export const COLOR_DOT: Record<ConfigColor, string> = {
  slate: "text-slate",
  blue: "text-blue-400",
  green: "text-green-400",
  amber: "text-amber-400",
  red: "text-red-400",
  violet: "text-violet-400",
  cyan: "text-cyan",
};

export interface StatusOption {
  /**
   * Value stored in Task.status. Immutable once any task uses it — renaming an
   * id would orphan every task holding the old one, so the UI edits `label`
   * and leaves this alone.
   */
  id: string;
  label: string;
  color: ConfigColor;
  /**
   * Terminal state. Controls real behaviour, not just appearance: a task in a
   * complete status stops counting as overdue and gets `completedAt` stamped.
   * That is why it is a flag rather than hardcoding the id "DONE".
   */
  isComplete: boolean;
}

export interface PriorityOption {
  id: string;
  label: string;
  color: ConfigColor;
}

/** Array order is display and sort order for both lists. */
export const DEFAULT_TASK_STATUSES: StatusOption[] = [
  { id: "PENDING", label: "Pending", color: "slate", isComplete: false },
  { id: "IN_PROGRESS", label: "In Progress", color: "blue", isComplete: false },
  { id: "DONE", label: "Done", color: "green", isComplete: true },
];

export const DEFAULT_TASK_PRIORITIES: PriorityOption[] = [
  { id: "URGENT", label: "Urgent", color: "red" },
  { id: "HIGH", label: "High", color: "amber" },
  { id: "MEDIUM", label: "Medium", color: "slate" },
  { id: "LOW", label: "Low", color: "slate" },
];

export const SETTING_KEYS = {
  taskStatuses: "projects.taskStatuses",
  taskPriorities: "projects.taskPriorities",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

// ── ids ─────────────────────────────────────────────────────────────────────

/** Ids are the stored database value: uppercase, underscore-separated. */
export const ID_PATTERN = /^[A-Z][A-Z0-9_]{0,31}$/;

/** Derive a valid id from a label ("Requires client approval" → REQUIRES_CLIENT_APPROVAL). */
export function idFromLabel(label: string): string {
  const id = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32)
    .replace(/_+$/, "");
  // Must start with a letter — a label like "1st pass" would otherwise produce
  // an id the pattern rejects.
  return ID_PATTERN.test(id) ? id : `S_${id}`.slice(0, 32);
}

// ── validation ──────────────────────────────────────────────────────────────

export interface ValidationResult<T> {
  ok: boolean;
  /** Present when ok; the cleaned, canonical list. */
  value?: T;
  /** Present when not ok; a message written for the admin, not the log. */
  error?: string;
}

function cleanColor(c: unknown): ConfigColor {
  return CONFIG_COLORS.includes(c as ConfigColor) ? (c as ConfigColor) : "slate";
}

/**
 * Validate a status list.
 *
 * Requires at least one status, and at least one marked complete — with none,
 * no task could ever be finished and overdue reminders would never stop, which
 * is a worse state than any labelling mistake.
 */
export function validateStatuses(input: unknown): ValidationResult<StatusOption[]> {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "Add at least one status." };
  }
  if (input.length > 12) {
    return { ok: false, error: "Twelve statuses is the maximum — the board becomes unreadable beyond that." };
  }

  const out: StatusOption[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    const r = raw as Partial<StatusOption>;
    const label = String(r.label ?? "").trim();
    if (!label) return { ok: false, error: "Every status needs a name." };
    if (label.length > 32) return { ok: false, error: `"${label.slice(0, 20)}…" is too long — 32 characters maximum.` };

    const id = String(r.id ?? "").trim() || idFromLabel(label);
    if (!ID_PATTERN.test(id)) {
      return { ok: false, error: `"${label}" produced an invalid internal id (${id}). Use letters, numbers and spaces.` };
    }
    if (seen.has(id)) return { ok: false, error: `Two statuses resolve to the same id (${id}). Give them more distinct names.` };
    seen.add(id);

    out.push({ id, label, color: cleanColor(r.color), isComplete: Boolean(r.isComplete) });
  }

  if (!out.some((s) => s.isComplete)) {
    return {
      ok: false,
      error: "Mark at least one status as complete, otherwise no task can ever be finished and overdue reminders never stop.",
    };
  }
  return { ok: true, value: out };
}

/** Validate a priority list. Order is urgency, highest first. */
export function validatePriorities(input: unknown): ValidationResult<PriorityOption[]> {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "Add at least one priority." };
  }
  if (input.length > 8) return { ok: false, error: "Eight priorities is the maximum." };

  const out: PriorityOption[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    const r = raw as Partial<PriorityOption>;
    const label = String(r.label ?? "").trim();
    if (!label) return { ok: false, error: "Every priority needs a name." };
    if (label.length > 32) return { ok: false, error: `"${label.slice(0, 20)}…" is too long — 32 characters maximum.` };

    const id = String(r.id ?? "").trim() || idFromLabel(label);
    if (!ID_PATTERN.test(id)) {
      return { ok: false, error: `"${label}" produced an invalid internal id (${id}).` };
    }
    if (seen.has(id)) return { ok: false, error: `Two priorities resolve to the same id (${id}).` };
    seen.add(id);

    out.push({ id, label, color: cleanColor(r.color) });
  }
  return { ok: true, value: out };
}

// ── parsing stored values ───────────────────────────────────────────────────

/**
 * Parse a stored setting, falling back to the default on anything unexpected.
 *
 * Never throws. A corrupt configuration row must not take down the project
 * board — falling back to the built-in list keeps the app working while the
 * admin fixes it.
 */
export function parseStatuses(raw: string | null | undefined): StatusOption[] {
  if (!raw) return DEFAULT_TASK_STATUSES;
  try {
    const result = validateStatuses(JSON.parse(raw));
    return result.ok && result.value ? result.value : DEFAULT_TASK_STATUSES;
  } catch {
    return DEFAULT_TASK_STATUSES;
  }
}

export function parsePriorities(raw: string | null | undefined): PriorityOption[] {
  if (!raw) return DEFAULT_TASK_PRIORITIES;
  try {
    const result = validatePriorities(JSON.parse(raw));
    return result.ok && result.value ? result.value : DEFAULT_TASK_PRIORITIES;
  } catch {
    return DEFAULT_TASK_PRIORITIES;
  }
}

// ── lookups used by both sides ──────────────────────────────────────────────

export function statusById(statuses: StatusOption[], id: string): StatusOption | undefined {
  return statuses.find((s) => s.id === id);
}

export function statusLabel(statuses: StatusOption[], id: string): string {
  return statusById(statuses, id)?.label ?? id;
}

/** True when `id` is a configured terminal status. Unknown ids are not complete. */
export function isCompleteStatus(statuses: StatusOption[], id: string): boolean {
  return statusById(statuses, id)?.isComplete ?? false;
}

export function priorityLabel(priorities: PriorityOption[], id: string): string {
  return priorities.find((p) => p.id === id)?.label ?? id;
}

/** Urgency rank by array position; unknown ids sort last. */
export function priorityRank(priorities: PriorityOption[], id: string): number {
  const i = priorities.findIndex((p) => p.id === id);
  return i === -1 ? priorities.length : i;
}
