import { describe, it, expect } from "vitest";
import { jsonArray, jsonObject, jsonNumberMap } from "./json";

/**
 * These cover the exact shapes MariaDB hands back: JSON columns are LONGTEXT
 * there, so every value arrives as a string.
 */
describe("jsonArray", () => {
  it("parses the string form MariaDB returns", () => {
    expect(jsonArray('["a","b"]')).toEqual(["a", "b"]);
    expect(jsonArray("[]")).toEqual([]);
  });

  it("passes through an already-parsed array (MySQL 8 / mysql2)", () => {
    expect(jsonArray(["a"])).toEqual(["a"]);
  });

  it("returns [] for null, undefined and empty strings", () => {
    expect(jsonArray(null)).toEqual([]);
    expect(jsonArray(undefined)).toEqual([]);
    expect(jsonArray("")).toEqual([]);
    expect(jsonArray("   ")).toEqual([]);
  });

  it("returns [] rather than throwing on malformed JSON", () => {
    expect(jsonArray("{not json")).toEqual([]);
  });

  it("returns [] when the value parses to a non-array", () => {
    expect(jsonArray('{"a":1}')).toEqual([]);
    expect(jsonArray("42")).toEqual([]);
  });

  it("handles arrays of objects, the common evidence/tags shape", () => {
    expect(jsonArray<{ claim: string }>('[{"claim":"x"}]')).toEqual([{ claim: "x" }]);
  });
});

describe("jsonObject", () => {
  it("parses the string form", () => {
    expect(jsonObject('{"a":1}')).toEqual({ a: 1 });
    expect(jsonObject("{}")).toEqual({});
  });

  it("passes through an already-parsed object", () => {
    expect(jsonObject({ a: 1 })).toEqual({ a: 1 });
  });

  it("returns {} for arrays, null and malformed input", () => {
    expect(jsonObject("[1,2]")).toEqual({});
    expect(jsonObject(null)).toEqual({});
    expect(jsonObject("nope")).toEqual({});
  });
});

describe("jsonNumberMap", () => {
  it("coerces values to numbers and drops non-numeric ones", () => {
    expect(jsonNumberMap('{"a":1,"b":"2","c":"x"}')).toEqual({ a: 1, b: 2 });
  });

  it("returns {} for an empty or invalid value", () => {
    expect(jsonNumberMap(null)).toEqual({});
    expect(jsonNumberMap("[]")).toEqual({});
  });
});
