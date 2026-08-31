import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Guard against passing a plain closure from a server component to a client
 * component.
 *
 * React cannot serialise an ordinary function across that boundary, so
 * `action={() => doThing(id)}` in a server component compiles, type-checks,
 * builds — and then fails at runtime with "Functions cannot be passed directly
 * to Client Components". It bit the chat Join control. `doThing.bind(null, id)`
 * is the correct form: a bound server action IS serialisable.
 *
 * This is a lint rule expressed as a test because no ESLint rule covers it, and
 * the failure mode is invisible until someone clicks the control in production.
 */

const CLIENT_COMPONENTS_TAKING_ACTIONS = ["ActionForm"];

/** Every .tsx file under src/app, excluding generated output. */
function tsxFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "generated") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) tsxFiles(full, out);
    else if (entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("server action props", () => {
  const files = tsxFiles("src/app");

  it("finds files to check", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("never passes an inline closure as an action to a client component", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const src = readFileSync(file, "utf8");
      // Only server components matter — a client component may pass closures freely.
      if (/^\s*["']use client["']/m.test(src)) continue;

      for (const component of CLIENT_COMPONENTS_TAKING_ACTIONS) {
        // <ActionForm … action={() => …}  or  action={async () => …}
        const pattern = new RegExp(
          `<${component}[^>]*\\saction=\\{\\s*(?:async\\s*)?\\(`,
          "g",
        );
        for (const m of src.matchAll(pattern)) {
          const line = src.slice(0, m.index).split("\n").length;
          offenders.push(`${file}:${line} — ${component} action={(…) => …}`);
        }
      }
    }

    expect(
      offenders,
      "Pass a bound server action instead: action={doThing.bind(null, id)}. " +
        "A closure created in a server component cannot be serialised to a " +
        "client component and fails at runtime.",
    ).toEqual([]);
  });

  it("catches the pattern when it is present", () => {
    // Proves the regex actually matches the shape it is meant to catch, so a
    // passing suite means "clean", not "the check silently does nothing".
    const bad = `<ActionForm action={() => joinChannelAction(ch.id)}>`;
    const good = `<ActionForm action={joinChannelAction.bind(null, ch.id)}>`;
    const re = /<ActionForm[^>]*\saction=\{\s*(?:async\s*)?\(/;
    expect(re.test(bad)).toBe(true);
    expect(re.test(good)).toBe(false);
  });
});
