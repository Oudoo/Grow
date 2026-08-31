import { describe, it, expect } from "vitest";
import {
  DEFAULT_TASK_PRIORITIES, DEFAULT_TASK_STATUSES,
  idFromLabel, isCompleteStatus, parsePriorities, parseStatuses,
  priorityRank, statusLabel, validatePriorities, validateStatuses,
} from "./config-types";

describe("idFromLabel", () => {
  it("derives a stored id from a human label", () => {
    expect(idFromLabel("Blocked")).toBe("BLOCKED");
    expect(idFromLabel("Requires client approval")).toBe("REQUIRES_CLIENT_APPROVAL");
  });

  it("collapses punctuation and trims separators", () => {
    expect(idFromLabel("  In-Review / QA  ")).toBe("IN_REVIEW_QA");
    expect(idFromLabel("Done!!!")).toBe("DONE");
  });

  it("prefixes a label that would not start with a letter", () => {
    // Ids must begin with a letter, so "1st pass" cannot become "1ST_PASS".
    expect(idFromLabel("1st pass")).toMatch(/^S_/);
  });

  it("stays within the length limit", () => {
    expect(idFromLabel("a".repeat(80)).length).toBeLessThanOrEqual(32);
  });
});

describe("validateStatuses", () => {
  const ok = (extra: object = {}) => ({ label: "Doing", color: "blue", isComplete: false, ...extra });

  it("accepts the built-in defaults unchanged", () => {
    const r = validateStatuses(DEFAULT_TASK_STATUSES);
    expect(r.ok).toBe(true);
    expect(r.value).toEqual(DEFAULT_TASK_STATUSES);
  });

  it("fills in a missing id from the label", () => {
    const r = validateStatuses([ok(), { label: "Shipped", isComplete: true }]);
    expect(r.ok).toBe(true);
    expect(r.value?.map((s) => s.id)).toEqual(["DOING", "SHIPPED"]);
  });

  it("requires at least one status", () => {
    expect(validateStatuses([]).ok).toBe(false);
    expect(validateStatuses(null).ok).toBe(false);
  });

  it("requires at least one status marked complete", () => {
    // Without one, nothing can ever finish and overdue reminders never stop.
    const r = validateStatuses([ok()]);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/complete/i);
  });

  it("rejects a blank name", () => {
    const r = validateStatuses([{ label: "  ", isComplete: true }]);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/needs a name/i);
  });

  it("rejects an over-long name", () => {
    expect(validateStatuses([{ label: "x".repeat(40), isComplete: true }]).ok).toBe(false);
  });

  it("rejects two options that collapse to the same id", () => {
    // "In progress" and "In-Progress" both become IN_PROGRESS.
    const r = validateStatuses([
      { label: "In progress", isComplete: false },
      { label: "In-Progress", isComplete: true },
    ]);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/same id/i);
  });

  it("caps the number of statuses", () => {
    const many = Array.from({ length: 13 }, (_, i) => ({ label: `S${i}`, isComplete: i === 0 }));
    expect(validateStatuses(many).ok).toBe(false);
  });

  it("falls back to slate for an unknown colour rather than failing", () => {
    const r = validateStatuses([{ label: "Doing", color: "hotpink", isComplete: true }]);
    expect(r.ok).toBe(true);
    expect(r.value?.[0].color).toBe("slate");
  });
});

describe("validatePriorities", () => {
  it("accepts the defaults", () => {
    expect(validatePriorities(DEFAULT_TASK_PRIORITIES).ok).toBe(true);
  });

  it("does not require a complete flag", () => {
    expect(validatePriorities([{ label: "Normal" }]).ok).toBe(true);
  });

  it("requires at least one, and caps at eight", () => {
    expect(validatePriorities([]).ok).toBe(false);
    expect(validatePriorities(Array.from({ length: 9 }, (_, i) => ({ label: `P${i}` }))).ok).toBe(false);
  });
});

describe("parseStatuses / parsePriorities", () => {
  it("returns the defaults for a missing value", () => {
    expect(parseStatuses(null)).toEqual(DEFAULT_TASK_STATUSES);
    expect(parsePriorities(undefined)).toEqual(DEFAULT_TASK_PRIORITIES);
  });

  it("returns the defaults for malformed JSON rather than throwing", () => {
    // A corrupt configuration row must not take the project board down.
    expect(parseStatuses("{not json")).toEqual(DEFAULT_TASK_STATUSES);
  });

  it("returns the defaults for JSON that fails validation", () => {
    // Valid JSON, but no complete status.
    expect(parseStatuses('[{"id":"A","label":"A","color":"slate","isComplete":false}]'))
      .toEqual(DEFAULT_TASK_STATUSES);
  });

  it("round-trips a valid custom list", () => {
    const custom = [
      { id: "TODO", label: "To do", color: "slate" as const, isComplete: false },
      { id: "SHIPPED", label: "Shipped", color: "green" as const, isComplete: true },
    ];
    expect(parseStatuses(JSON.stringify(custom))).toEqual(custom);
  });
});

describe("lookups", () => {
  it("labels a known status and falls back to the raw id", () => {
    expect(statusLabel(DEFAULT_TASK_STATUSES, "IN_PROGRESS")).toBe("In Progress");
    expect(statusLabel(DEFAULT_TASK_STATUSES, "GONE")).toBe("GONE");
  });

  it("reports completeness from the flag, not the id", () => {
    expect(isCompleteStatus(DEFAULT_TASK_STATUSES, "DONE")).toBe(true);
    expect(isCompleteStatus(DEFAULT_TASK_STATUSES, "PENDING")).toBe(false);
    // An unknown id is not complete — a task with a stale status stays open.
    expect(isCompleteStatus(DEFAULT_TASK_STATUSES, "WHATEVER")).toBe(false);
  });

  it("honours a custom terminal status that is not called DONE", () => {
    const custom = [
      { id: "OPEN", label: "Open", color: "slate" as const, isComplete: false },
      { id: "APPROVED", label: "Approved", color: "green" as const, isComplete: true },
    ];
    expect(isCompleteStatus(custom, "APPROVED")).toBe(true);
    expect(isCompleteStatus(custom, "DONE")).toBe(false);
  });

  it("ranks priorities by position and sorts unknowns last", () => {
    expect(priorityRank(DEFAULT_TASK_PRIORITIES, "URGENT")).toBe(0);
    expect(priorityRank(DEFAULT_TASK_PRIORITIES, "LOW")).toBe(3);
    expect(priorityRank(DEFAULT_TASK_PRIORITIES, "MYSTERY")).toBe(4);
  });
});
