import { afterEach, describe, expect, it } from "vitest";
import { developerEmails, isDeveloper } from "./access";

const original = process.env.DEVELOPER_EMAILS;
afterEach(() => {
  if (original === undefined) delete process.env.DEVELOPER_EMAILS;
  else process.env.DEVELOPER_EMAILS = original;
});

describe("isDeveloper", () => {
  it("is the owner's login by default, and only as SUPER_ADMIN", () => {
    delete process.env.DEVELOPER_EMAILS;
    expect(isDeveloper({ email: "Mahmoud.Hassan@growcdx.com", role: "SUPER_ADMIN" })).toBe(true);
    expect(isDeveloper({ email: "mahmoud.hassan@growcdx.com", role: "ADMIN" })).toBe(false);
    expect(isDeveloper({ email: "seif.mohammed@growcdx.com", role: "SUPER_ADMIN" })).toBe(false);
    expect(isDeveloper(null)).toBe(false);
  });

  it("follows DEVELOPER_EMAILS when set", () => {
    process.env.DEVELOPER_EMAILS = " a@x.com , B@Y.com ";
    expect(developerEmails()).toEqual(["a@x.com", "b@y.com"]);
    expect(isDeveloper({ email: "b@y.com", role: "SUPER_ADMIN" })).toBe(true);
    expect(isDeveloper({ email: "mahmoud.hassan@growcdx.com", role: "SUPER_ADMIN" })).toBe(false);
  });
});
