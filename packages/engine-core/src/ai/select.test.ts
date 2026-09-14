import { describe, expect, it } from "vitest";
import { chooseAi, fallbackOrder, modelFamily } from "./select.js";

const models = { anthropic: "claude-opus-5", gemini: "gemini-2.5-pro", openai: "gpt-4o" };

describe("modelFamily", () => {
  it("maps model prefixes to providers", () => {
    expect(modelFamily("claude-sonnet-5")).toBe("anthropic");
    expect(modelFamily("gemini-3.8-flash")).toBe("gemini");
    expect(modelFamily("gpt-4o-mini")).toBe("openai");
    expect(modelFamily("o3")).toBe("openai");
    expect(modelFamily("")).toBeNull();
    expect(modelFamily("llama-3")).toBeNull();
  });
});

describe("chooseAi", () => {
  it("routes to the only provider with a key, whatever the primary says", () => {
    const keys = { anthropic: false, gemini: true, openai: false };
    expect(chooseAi({ flagModel: "", primary: "anthropic", keys, models })).toEqual({ provider: "gemini", model: "gemini-2.5-pro" });
  });

  it("honours AI_PRIMARY_PROVIDER when it has a key", () => {
    const keys = { anthropic: true, gemini: true, openai: false };
    expect(chooseAi({ flagModel: "", primary: "gemini", keys, models })?.provider).toBe("gemini");
    expect(chooseAi({ flagModel: "", primary: "anthropic", keys, models })?.provider).toBe("anthropic");
  });

  it("lets the console's model override pick the provider, but only with a key", () => {
    const keys = { anthropic: true, gemini: true, openai: false };
    expect(chooseAi({ flagModel: "gemini-3.8-flash", primary: "anthropic", keys, models })).toEqual({ provider: "gemini", model: "gemini-3.8-flash" });
    const noGemini = { anthropic: true, gemini: false, openai: false };
    expect(chooseAi({ flagModel: "gemini-3.8-flash", primary: "anthropic", keys: noGemini, models })).toEqual({ provider: "anthropic", model: "claude-opus-5" });
  });

  it("a forced provider never answers from another one", () => {
    const keys = { anthropic: true, gemini: false, openai: false };
    expect(chooseAi({ flagModel: "", primary: "anthropic", keys, models, forced: "gemini" })).toBeNull();
    expect(chooseAi({ flagModel: "gemini-2.5-flash", primary: "gemini", keys, models, forced: "anthropic" })?.provider).toBe("anthropic");
  });

  it("returns null with no keys at all", () => {
    expect(chooseAi({ flagModel: "", primary: "gemini", keys: { anthropic: false, gemini: false, openai: false }, models })).toBeNull();
  });
});

describe("fallbackOrder", () => {
  it("lists the other keyed providers in canonical order", () => {
    expect(fallbackOrder("gemini", { anthropic: true, gemini: true, openai: true })).toEqual(["anthropic", "openai"]);
    expect(fallbackOrder("anthropic", { anthropic: true, gemini: false, openai: false })).toEqual([]);
  });
});
