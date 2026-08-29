/**
 * Safe reads for Drizzle `json()` columns.
 *
 * **Why this is necessary.** Drizzle's MySqlJson defines `mapToDriverValue`
 * (JSON.stringify on write) but no `mapFromDriverValue` — it never parses on
 * read, so what you get back is whatever the driver hands over. On MySQL 8 a
 * real JSON column is parsed by mysql2 and you get an object. **This app runs
 * on MariaDB (11.8), where `JSON` is an alias for LONGTEXT**, so mysql2 returns
 * a plain string and every one of those columns arrives unparsed.
 *
 * The generated types say `unknown`, so the codebase cast them —
 * `(rec.evidence as {claim: string}[]).map(...)` — which type-checks fine and
 * then throws `.map is not a function` at runtime. It stayed hidden only
 * because those tables were empty; the client detail page 500'd the moment a
 * client existed to render.
 *
 * A cast is a promise to the compiler. These helpers actually keep it.
 */

/** Parse if it is a JSON string; otherwise pass through. */
function coerce(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    // Not JSON — a plain string in a json column. Callers want a shape, not
    // this, so report nothing rather than something misleading.
    return undefined;
  }
}

/**
 * Read a json column as an array. Returns [] for null, malformed JSON, or a
 * value that parses to a non-array — never throws, so a bad row degrades to an
 * empty list instead of taking down the page around it.
 */
export function jsonArray<T = unknown>(value: unknown): T[] {
  const parsed = coerce(value);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

/** Read a json column as an object. Returns {} for null, malformed or non-object values. */
export function jsonObject<T extends object = Record<string, unknown>>(value: unknown): T {
  const parsed = coerce(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as T) : ({} as T);
}

/** Read a json column as a record of numbers — the shape used by score breakdowns. */
export function jsonNumberMap(value: unknown): Record<string, number> {
  const obj = jsonObject(value);
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj)) {
    const n = Number(v);
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
}
