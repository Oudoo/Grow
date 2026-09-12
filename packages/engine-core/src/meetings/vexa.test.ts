import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import {
  extractMayaCommands,
  jsonArrayFrom,
  normalizeVexaSegments,
  parseMeetingLink,
  verifyVexaSignature,
} from "./vexa.js";

describe("parseMeetingLink", () => {
  it("reads a Google Meet link, with or without query, and a bare code", () => {
    expect(parseMeetingLink("https://meet.google.com/abc-defg-hij")).toEqual({ platform: "google_meet", nativeMeetingId: "abc-defg-hij" });
    expect(parseMeetingLink("https://meet.google.com/abc-defg-hij?authuser=1&hs=122")).toEqual({ platform: "google_meet", nativeMeetingId: "abc-defg-hij" });
    expect(parseMeetingLink("ABC-DEFG-HIJ")).toEqual({ platform: "google_meet", nativeMeetingId: "abc-defg-hij" });
  });
  it("reads Teams /meet links with a passcode", () => {
    expect(parseMeetingLink("https://teams.live.com/meet/9349127043183?p=Ab12Cd")).toEqual({ platform: "teams", nativeMeetingId: "9349127043183", passcode: "Ab12Cd" });
    expect(parseMeetingLink("https://teams.microsoft.com/meet/234567890123?p=xyz987")).toEqual({ platform: "teams", nativeMeetingId: "234567890123", passcode: "xyz987" });
  });
  it("reads the invite text Teams prints beside the passcode", () => {
    expect(parseMeetingLink("Meeting ID: 234 567 890 123\nPasscode: aBcDeF")).toEqual({ platform: "teams", nativeMeetingId: "234567890123", passcode: "aBcDeF" });
    expect(parseMeetingLink("234 567 890 123")).toEqual({ platform: "teams", nativeMeetingId: "234567890123" });
  });
  it("refuses what it cannot address", () => {
    expect(parseMeetingLink("https://teams.microsoft.com/l/meetup-join/19%3ameeting_x%40thread.v2/0?context=%7B%7D")).toBeNull();
    expect(parseMeetingLink("https://zoom.us/j/123456789")).toBeNull();
    expect(parseMeetingLink("")).toBeNull();
  });
});

describe("extractMayaCommands", () => {
  const seg = (start: number, text: string, speaker = "Basem", interim = false) => ({ start, end: start + 3, text, speaker, ...(interim ? { interim: true } : {}) });

  it("captures what follows the bot's name and classifies it", () => {
    const notes = extractMayaCommands([
      seg(10, "Maya, note that the client wants the launch before Ramadan."),
      seg(20, "Maya action item: Seif sends the revised quotation by Thursday.", "Mahmoud"),
      seg(30, "So, Maya, we agreed on the teal palette for the rebrand."),
      seg(40, "Maya please prepare a proposal for the loyalty programme."),
      seg(50, "Maya, give us a recap at the end."),
    ]);
    expect(notes.map((n) => n.kind)).toEqual(["note", "action", "decision", "document", "summary"]);
    expect(notes[0].text).toBe("note that the client wants the launch before Ramadan.");
    expect(notes[1].speaker).toBe("Mahmoud");
    expect(notes[1].at).toBe(20);
  });

  it("ignores thanks, unaddressed speech, interim segments, and duplicates", () => {
    const notes = extractMayaCommands([
      seg(1, "Thanks, Maya."),
      seg(2, "We should raise prices next quarter."),
      seg(3, "Maya, note the budget is 40k monthly.", "Basem", true),
      seg(4, "Maya, note the budget is 40k monthly."),
      seg(4, "Maya, note the budget is 40k monthly."),
    ]);
    expect(notes).toHaveLength(1);
    expect(notes[0].text).toBe("note the budget is 40k monthly.");
  });

  it("respects a custom bot name and does not match it inside other words", () => {
    expect(extractMayaCommands([seg(1, "Amaya said nothing about it, really.")], "Maya")).toHaveLength(0);
    expect(extractMayaCommands([seg(1, "Nour, note that we ship on Sunday.")], "Nour")).toHaveLength(1);
  });
});

describe("normalizeVexaSegments", () => {
  it("keeps start/end/text/speaker, marks interim, drops empties, sorts by time", () => {
    const out = normalizeVexaSegments([
      { text: "second", start: 5, end: 6, speaker: "A", completed: true },
      { text: "   ", start: 1, end: 2 },
      { text: "first", start: 1.5, end: 2, speaker: null, completed: false },
    ]);
    expect(out).toEqual([
      { start: 1.5, end: 2, text: "first", interim: true },
      { start: 5, end: 6, text: "second", speaker: "A" },
    ]);
  });
});

describe("verifyVexaSignature", () => {
  it("accepts the documented HMAC over '<timestamp>.<body>' and nothing else", () => {
    const body = '{"event_type":"meeting.completed"}';
    const sig = `sha256=${createHmac("sha256", "s3cret").update(`1700000000.${body}`).digest("hex")}`;
    expect(verifyVexaSignature(body, "1700000000", sig, "s3cret")).toBe(true);
    expect(verifyVexaSignature(body, "1700000001", sig, "s3cret")).toBe(false);
    expect(verifyVexaSignature(body, "1700000000", sig, "other")).toBe(false);
    expect(verifyVexaSignature(body, null, sig, "s3cret")).toBe(false);
    expect(verifyVexaSignature(body, "1700000000", "sha256=00", "s3cret")).toBe(false);
  });
});

describe("jsonArrayFrom", () => {
  it("accepts arrays and JSON strings, rejects the rest", () => {
    expect(jsonArrayFrom([1])).toEqual([1]);
    expect(jsonArrayFrom("[1,2]")).toEqual([1, 2]);
    expect(jsonArrayFrom("{}")).toEqual([]);
    expect(jsonArrayFrom("nope")).toEqual([]);
    expect(jsonArrayFrom(null)).toEqual([]);
  });
});
