import { describe, it, expect } from "vitest";
import { dayKey, fromDayKey, indexByDay, isWeekend, monthGrid, shiftMonth } from "./calendar";

describe("dayKey", () => {
  it("uses local components, not UTC", () => {
    // 22:30 local on the 15th is the 15th. toISOString() would say the 16th for
    // anyone east of Greenwich — the bug this exists to avoid.
    expect(dayKey(new Date(2026, 8, 15, 22, 30))).toBe("2026-09-15");
    expect(dayKey(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
  });

  it("zero-pads month and day", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("fromDayKey", () => {
  it("round-trips with dayKey", () => {
    expect(dayKey(fromDayKey("2026-09-15")!)).toBe("2026-09-15");
  });
  it("returns null for nonsense", () => {
    expect(fromDayKey("not-a-date")).toBeNull();
  });
});

describe("monthGrid", () => {
  it("always returns six weeks", () => {
    // Whatever the month's shape, the grid height must not change.
    for (let m = 0; m < 12; m++) expect(monthGrid(2026, m)).toHaveLength(42);
    expect(monthGrid(2026, 1)).toHaveLength(42); // February
    expect(monthGrid(2024, 1)).toHaveLength(42); // leap February
  });

  it("starts on a Sunday", () => {
    for (let m = 0; m < 12; m++) expect(monthGrid(2026, m)[0].getDay()).toBe(0);
  });

  it("contains every day of the month", () => {
    const grid = monthGrid(2026, 8); // September, 30 days
    const inMonth = grid.filter((d) => d.getMonth() === 8);
    expect(inMonth).toHaveLength(30);
    expect(dayKey(inMonth[0])).toBe("2026-09-01");
    expect(dayKey(inMonth[29])).toBe("2026-09-30");
  });

  it("pads with the adjacent months, not blanks", () => {
    const grid = monthGrid(2026, 8);
    expect(grid[0].getMonth()).not.toBe(8);
    expect(grid[41].getMonth()).not.toBe(8);
  });
});

describe("isWeekend", () => {
  it("treats Friday and Saturday as the weekend", () => {
    // 2026-09-04 is a Friday, 2026-09-05 a Saturday.
    expect(isWeekend(new Date(2026, 8, 4))).toBe(true);
    expect(isWeekend(new Date(2026, 8, 5))).toBe(true);
    expect(isWeekend(new Date(2026, 8, 6))).toBe(false); // Sunday is a work day
    expect(isWeekend(new Date(2026, 8, 3))).toBe(false); // Thursday
  });
});

describe("indexByDay", () => {
  it("places a single-day item on its day", () => {
    const map = indexByDay([{ date: "2026-09-15", id: "a" }]);
    expect(map.get("2026-09-15")?.map((x) => x.id)).toEqual(["a"]);
  });

  it("expands a range across every day it covers, inclusive", () => {
    const map = indexByDay([{ date: "2026-09-01", endDate: "2026-09-03", id: "p" }]);
    expect([...map.keys()].sort()).toEqual(["2026-09-01", "2026-09-02", "2026-09-03"]);
  });

  it("spans a month boundary", () => {
    const map = indexByDay([{ date: "2026-09-29", endDate: "2026-10-02", id: "p" }]);
    expect([...map.keys()].sort()).toEqual([
      "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02",
    ]);
  });

  it("groups several items on one day", () => {
    const map = indexByDay([
      { date: "2026-09-15", id: "a" },
      { date: "2026-09-15", id: "b" },
    ]);
    expect(map.get("2026-09-15")).toHaveLength(2);
  });

  it("falls back to the start day for a backwards range", () => {
    const map = indexByDay([{ date: "2026-09-10", endDate: "2026-09-01", id: "x" }]);
    expect([...map.keys()]).toEqual(["2026-09-10"]);
  });

  it("bounds a runaway range instead of hanging", () => {
    const map = indexByDay([{ date: "2026-01-01", endDate: "2099-01-01", id: "x" }], 30);
    expect(map.size).toBe(30);
  });

  it("skips an item with no date", () => {
    expect(indexByDay([{ date: "", id: "x" }]).size).toBe(0);
  });
});

describe("shiftMonth", () => {
  it("crosses the year boundary in both directions", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });
});
