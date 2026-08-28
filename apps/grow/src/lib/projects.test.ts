import { describe, it, expect, vi, afterEach } from "vitest";
import { daysUntilDue, isOverdue, dueLabel, formatDueDate, normalisePriority, normaliseStatus } from "./projects";

/** Due dates are written at 12:00 UTC — mirror that in the fixtures. */
function dueOn(iso: string) {
  return new Date(`${iso}T12:00:00.000Z`);
}

function freezeAt(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

afterEach(() => vi.useRealTimers());

describe("daysUntilDue", () => {
  it("returns 0 for a task due today", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(daysUntilDue(dueOn("2026-08-28"))).toBe(0);
  });

  it("counts forward and backward in whole days", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(daysUntilDue(dueOn("2026-08-31"))).toBe(3);
    expect(daysUntilDue(dueOn("2026-08-25"))).toBe(-3);
  });

  it("is stable across the UTC day boundary", () => {
    // 23:30 UTC and 00:30 UTC the next day are different calendar days; a task
    // due "tomorrow" must not silently become "today" as the clock ticks over.
    freezeAt("2026-08-28T23:30:00.000Z");
    expect(daysUntilDue(dueOn("2026-08-29"))).toBe(1);
    freezeAt("2026-08-29T00:30:00.000Z");
    expect(daysUntilDue(dueOn("2026-08-29"))).toBe(0);
  });

  it("handles null and unparseable input", () => {
    expect(daysUntilDue(null)).toBeNull();
    expect(daysUntilDue(undefined)).toBeNull();
    expect(daysUntilDue("not a date")).toBeNull();
  });

  it("accepts an ISO string as well as a Date", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(daysUntilDue("2026-08-30T12:00:00.000Z")).toBe(2);
  });
});

describe("isOverdue", () => {
  it("flags an open task past its due date", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(isOverdue(dueOn("2026-08-27"), "PENDING")).toBe(true);
    expect(isOverdue(dueOn("2026-08-27"), "IN_PROGRESS")).toBe(true);
  });

  it("never flags a completed task, however late it was", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(isOverdue(dueOn("2026-01-01"), "DONE")).toBe(false);
  });

  it("does not flag a task due today", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(isOverdue(dueOn("2026-08-28"), "PENDING")).toBe(false);
  });

  it("does not flag a task with no due date", () => {
    expect(isOverdue(null, "PENDING")).toBe(false);
  });
});

describe("dueLabel", () => {
  it("describes the near term in relative terms", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(dueLabel(dueOn("2026-08-28"), "PENDING")).toBe("Due today");
    expect(dueLabel(dueOn("2026-08-29"), "PENDING")).toBe("Due tomorrow");
    expect(dueLabel(dueOn("2026-09-02"), "PENDING")).toBe("Due in 5d");
    expect(dueLabel(dueOn("2026-08-26"), "PENDING")).toBe("Overdue by 2d");
  });

  it("falls back to an absolute date beyond a week", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(dueLabel(dueOn("2026-10-01"), "PENDING")).toBe("2026-10-01");
  });

  it("shows a plain date for completed work rather than an urgency", () => {
    freezeAt("2026-08-28T09:00:00.000Z");
    expect(dueLabel(dueOn("2026-08-20"), "DONE")).toBe("2026-08-20");
  });
});

describe("formatDueDate", () => {
  it("renders the stored calendar day in UTC", () => {
    expect(formatDueDate(dueOn("2026-08-28"))).toBe("2026-08-28");
  });
  it("returns null for missing or invalid values", () => {
    expect(formatDueDate(null)).toBeNull();
    expect(formatDueDate("nope")).toBeNull();
  });
});

describe("normalisers", () => {
  it("falls back to MEDIUM for anything unrecognised", () => {
    expect(normalisePriority("URGENT")).toBe("URGENT");
    expect(normalisePriority("bogus")).toBe("MEDIUM");
    expect(normalisePriority(undefined)).toBe("MEDIUM");
  });

  it("rejects an unknown status rather than guessing", () => {
    expect(normaliseStatus("DONE")).toBe("DONE");
    expect(normaliseStatus("ARCHIVED")).toBeNull();
  });
});
