import { describe, expect, it } from "vitest";
import { DEV_FLAG_DEFS, defaultDevFlags, parseDevFlags } from "./dev-flags.js";

describe("parseDevFlags", () => {
  it("returns the defaults for nothing, garbage, and non-objects", () => {
    expect(parseDevFlags(null)).toEqual(defaultDevFlags());
    expect(parseDevFlags("not json")).toEqual(defaultDevFlags());
    expect(parseDevFlags("[1,2]")).toEqual(defaultDevFlags());
    expect(parseDevFlags("42")).toEqual(defaultDevFlags());
  });

  it("merges known keys of the right type and ignores the rest", () => {
    const flags = parseDevFlags(
      JSON.stringify({
        "ai.enabled": false,
        "ai.model": "claude-sonnet-5",
        "maintenance.banner": "Deploying at 18:00",
        "workers.paused": "yes", // wrong type — ignored
        "ai.rogue": true, // unknown — ignored
      })
    );
    expect(flags["ai.enabled"]).toBe(false);
    expect(flags["ai.model"]).toBe("claude-sonnet-5");
    expect(flags["maintenance.banner"]).toBe("Deploying at 18:00");
    expect(flags["workers.paused"]).toBe(false);
    expect((flags as Record<string, unknown>)["ai.rogue"]).toBeUndefined();
  });

  it("refuses a model that is not on the list", () => {
    expect(parseDevFlags(JSON.stringify({ "ai.model": "gpt-9" }))["ai.model"]).toBe("");
    expect(DEV_FLAG_DEFS["ai.model"].options).toContain("claude-opus-5");
  });

  it("caps banner length so a paste cannot break the layout", () => {
    expect(parseDevFlags(JSON.stringify({ "maintenance.banner": "x".repeat(2000) }))["maintenance.banner"]).toHaveLength(500);
  });
});
