import { describe, it, expect } from "vitest";
import { findMentions, mentionedUserIds, segmentMentions } from "./mentions";

const DIR = [
  { id: "u1", name: "Mahmoud Hassan", email: "mahmoud.hassan@growcdx.com" },
  { id: "u2", name: "Ahmed Alaa", email: "ahmed.alaa@growcdx.com" },
  { id: "u3", name: "Ahmed Shennawy", email: "shennawy@growcdx.com" },
  { id: "u4", name: "Danya", email: "danya.mohamed@growcdx.com" },
];

describe("findMentions", () => {
  it("matches a full name containing a space", () => {
    const m = findMentions("ping @Mahmoud Hassan on this", DIR);
    expect(m.map((x) => x.id)).toEqual(["u1"]);
    expect(m[0].matched).toBe("Mahmoud Hassan");
  });

  it("prefers the longest handle over a bare first name", () => {
    // "Mahmoud" is unique so it is also a handle; the full name must win.
    const m = findMentions("@Mahmoud Hassan", DIR);
    expect(m).toHaveLength(1);
    expect(m[0].end).toBe("@Mahmoud Hassan".length);
  });

  it("matches an unambiguous first name on its own", () => {
    expect(mentionedUserIds("thanks @Danya", DIR)).toEqual(["u4"]);
  });

  it("does not resolve an ambiguous first name", () => {
    // Two people are called Ahmed — "@Ahmed" alone must not pick one.
    expect(mentionedUserIds("hey @Ahmed can you look", DIR)).toEqual([]);
  });

  it("still resolves each ambiguous person by full name", () => {
    expect(mentionedUserIds("@Ahmed Alaa and @Ahmed Shennawy", DIR)).toEqual(["u2", "u3"]);
  });

  it("matches by email address", () => {
    expect(mentionedUserIds("@shennawy@growcdx.com please review", DIR)).toEqual(["u3"]);
  });

  it("ignores an email address written as prose, without a leading @", () => {
    expect(mentionedUserIds("mail danya.mohamed@growcdx.com directly", DIR)).toEqual([]);
  });

  it("ignores unknown handles", () => {
    expect(mentionedUserIds("@Nobody At All", DIR)).toEqual([]);
  });

  it("requires a boundary before the @", () => {
    expect(mentionedUserIds("x@Danya", DIR)).toEqual([]);
  });

  it("requires a boundary after the handle", () => {
    expect(mentionedUserIds("@Danyaxyz", DIR)).toEqual([]);
  });

  it("de-duplicates repeated mentions of one person", () => {
    expect(mentionedUserIds("@Danya @Danya", DIR)).toEqual(["u4"]);
  });

  it("handles empty input and an empty directory", () => {
    expect(findMentions("", DIR)).toEqual([]);
    expect(findMentions("@Danya", [])).toEqual([]);
  });
});

describe("segmentMentions", () => {
  it("splits text around a mention", () => {
    expect(segmentMentions("hi @Danya bye", DIR)).toEqual([
      { type: "text", value: "hi " },
      { type: "mention", value: "@Danya", id: "u4" },
      { type: "text", value: " bye" },
    ]);
  });

  it("returns a single text segment when nothing matches", () => {
    expect(segmentMentions("plain text", DIR)).toEqual([{ type: "text", value: "plain text" }]);
  });

  it("reassembles to exactly the original text", () => {
    const src = "@Ahmed Alaa please sync with @Danya about @Mahmoud Hassan's note";
    expect(segmentMentions(src, DIR).map((s) => s.value).join("")).toBe(src);
  });
});
