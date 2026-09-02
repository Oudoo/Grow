/**
 * Month-calendar arithmetic, shared by the engine's client schedule and the
 * hub's project schedule.
 *
 * The two calendars render through different design systems, so their
 * components are separate — but the parts that are easy to get wrong are here,
 * once, with tests: building the grid, formatting a day key without drifting a
 * timezone, and expanding a date range across the cells it covers.
 */

/** Sunday. The Egyptian working week runs Sunday–Thursday. */
export const WEEK_START = 0;

/** Friday and Saturday. Shaded, not hidden — work still lands on them. */
export const WEEKEND_DAYS = [5, 6];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * A date's calendar day as YYYY-MM-DD, read in LOCAL time.
 *
 * Deliberately not `toISOString().slice(0, 10)`, which converts to UTC first —
 * an 8pm date would then render on the previous day for anyone east of
 * Greenwich, which is everyone using this.
 */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD key to a local Date at midday, safe from DST edges. */
export function fromDayKey(key: string): Date | null {
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * The 42 days (6 rows × 7) covering a month, including padding either side.
 *
 * Always six rows: a month needing five would otherwise make the grid change
 * height as you page through, and the layout would jump under the cursor.
 */
export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - WEEK_START + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

export function isWeekend(d: Date): boolean {
  return WEEKEND_DAYS.includes(d.getDay());
}

/** Anything placeable on the calendar: one day, or a range. */
export interface DatedItem {
  /** YYYY-MM-DD — the day it lands on, or a range's first day. */
  date: string;
  /** YYYY-MM-DD, inclusive. Ranges only. */
  endDate?: string | null;
}

/**
 * Index items by day key, expanding a range across every day it covers.
 *
 * The walk is bounded: a corrupt end date far in the future would otherwise spin
 * indefinitely while building a page.
 */
export function indexByDay<T extends DatedItem>(items: T[], maxSpanDays = 400): Map<string, T[]> {
  const map = new Map<string, T[]>();
  const push = (key: string, item: T) => {
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  };

  for (const item of items) {
    if (!item.date) continue;
    if (!item.endDate || item.endDate === item.date) {
      push(item.date, item);
      continue;
    }
    const start = fromDayKey(item.date);
    const end = fromDayKey(item.endDate);
    if (!start || !end || end < start) {
      // A backwards or unparseable range still shows on its start day rather
      // than vanishing from the calendar entirely.
      push(item.date, item);
      continue;
    }
    let cursor = start;
    for (let guard = 0; cursor <= end && guard < maxSpanDays; guard++) {
      push(dayKey(cursor), item);
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
  }
  return map;
}

/** Month label for a header, e.g. "September 2026". */
export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Step a {year, month} cursor by whole months, handling the year boundary. */
export function shiftMonth(cursor: { year: number; month: number }, by: number) {
  const d = new Date(cursor.year, cursor.month + by, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
