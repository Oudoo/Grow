#!/usr/bin/env node
/**
 * Pre-push guard: refuse to push a state that would take growcdx.com down.
 *
 * Hostinger deploys this repo straight from `main` and never runs `next build`
 * on the server, so the committed `apps/grow/.next` IS the deployed site. Two
 * ways that goes wrong, both of which have actually happened:
 *
 *   1. The build is not committed at all — the server has nothing to serve and
 *      every route 500s behind a stale CDN copy of the homepage.
 *   2. The build is committed but stale — source changed, `npm run build` was
 *      never re-run, and the deploy silently ships the previous version.
 *
 * This check catches both before the push leaves the machine. Wire it up with:
 *   git config core.hooksPath .githooks
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(dirname(fileURLToPath(import.meta.url))); // apps/grow
const nextDir = join(appDir, ".next");
const buildIdPath = join(nextDir, "BUILD_ID");

const fail = (...lines) => {
  console.error("\n✖ Push blocked — this would break growcdx.com\n");
  for (const l of lines) console.error("  " + l);
  console.error("\n  Fix:  npm run build && git add apps/grow/.next && git commit --amend --no-edit");
  console.error("  Skip (only if you know why):  git push --no-verify\n");
  process.exit(1);
};

if (!existsSync(buildIdPath)) {
  fail("apps/grow/.next/BUILD_ID is missing — there is no built app to deploy.");
}

// The build must be tracked, not just present locally.
let trackedCount = 0;
try {
  const out = execFileSync("git", ["ls-files", "--", "apps/grow/.next"], { encoding: "utf8" });
  trackedCount = out.split("\n").filter(Boolean).length;
} catch {
  // Not a git repo / git unavailable — nothing useful to assert.
  process.exit(0);
}
if (trackedCount === 0) {
  fail(
    "apps/grow/.next exists locally but is NOT tracked by git.",
    "The server would deploy a repo with no application in it.",
  );
}

// The build must not be older than the sources it was built from.
const buildTime = statSync(buildIdPath).mtimeMs;
const SKIP = new Set(["node_modules", ".next", ".git"]);
let newest = { time: 0, path: null };

function scan(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (/\.(tsx?|jsx?|css|mjs)$/.test(entry.name)) {
      const { mtimeMs } = statSync(full);
      if (mtimeMs > newest.time) newest = { time: mtimeMs, path: full };
    }
  }
}
scan(join(appDir, "src"));

if (newest.time > buildTime) {
  const mins = Math.round((newest.time - buildTime) / 60000);
  fail(
    `The committed build is STALE — it predates your source changes by ~${mins} min.`,
    `Newest source: ${newest.path.replace(appDir + "/", "")}`,
    "Deploying now would ship the previous version of the site.",
  );
}

console.log(`✓ deploy check: build ${trackedCount} files tracked, newer than sources.`);
