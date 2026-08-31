import { describe, it, expect } from "vitest";
import { dmKeyFor, dmSlug } from "./dm-slug";

const A = "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const C = "33333333-cccc-4ccc-8ccc-cccccccccccc";

describe("dmKeyFor", () => {
  it("is order-independent, so one pair has one key", () => {
    expect(dmKeyFor(A, B)).toBe(dmKeyFor(B, A));
  });
});

describe("dmSlug", () => {
  it("is stable for the same pair", () => {
    expect(dmSlug(dmKeyFor(A, B))).toBe(dmSlug(dmKeyFor(B, A)));
  });

  it("differs for different pairs that share a participant", () => {
    // The exact regression: both pairs start with A, and the old
    // truncated-base64 slug collapsed them onto one value, so the second DM
    // failed on the unique index.
    const ab = dmSlug(dmKeyFor(A, B));
    const ac = dmSlug(dmKeyFor(A, C));
    expect(ab).not.toBe(ac);
  });

  it("differs across many pairs sharing the first participant", () => {
    const slugs = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const other = `${String(i).padStart(8, "0")}-dddd-4ddd-8ddd-dddddddddddd`;
      slugs.add(dmSlug(dmKeyFor(A, other)));
    }
    expect(slugs.size).toBe(200);
  });

  it("does not contain either participant id", () => {
    const slug = dmSlug(dmKeyFor(A, B));
    expect(slug).not.toContain(A);
    expect(slug).not.toContain(B);
    expect(slug).not.toContain(A.slice(0, 8));
  });

  it("is a short, URL-safe, stable shape", () => {
    expect(dmSlug(dmKeyFor(A, B))).toMatch(/^dm-[0-9a-f]{16}$/);
  });
});
