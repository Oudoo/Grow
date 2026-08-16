#!/usr/bin/env node
/**
 * Publish the freshly built app to Passenger's app root, and restart it.
 *
 * WHY THIS EXISTS
 * ---------------
 * growcdx.com serves traffic through Passenger:
 *
 *   PassengerAppRoot     /home/u454713534/domains/growcdx.com/nodejs
 *   PassengerStartupFile server.js
 *   PassengerRestartDir  /home/u454713534/domains/growcdx.com/nodejs/tmp
 *
 * The host builds in <domain>/hbuilds/source/repository and copies the build
 * output into <domain>/public_html. Nothing writes to <domain>/nodejs — it was
 * last written 2026-06-24 by a one-off archive upload. So every git deploy
 * since built correctly, reported success, and left the serving process on the
 * June app.
 *
 * A first attempt made nodejs/server.js a one-line shim that `require`d the
 * build directory's server.js. Passenger restarted onto it and the app 503'd,
 * so the build directory is NOT a durable path to depend on at runtime — it is
 * a build workspace, not a deploy target.
 *
 * So this copies the built app into the app root instead: self-contained, with
 * nothing pointing outside <domain>/nodejs once the copy lands.
 *
 * Recovery: nodejs/server.js.pre-publish.bak holds the original June file. If
 * a publish ever leaves the app broken, restoring that file and touching
 * tmp/restart.txt brings the previous app back.
 *
 * Safe by construction: no-ops where the layout is absent (local, CI), and
 * never fails the build.
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync, cpSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const log = (s) => console.log(`[publish] ${s}`);

function findDomainDir(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "nodejs")) && existsSync(join(dir, "public_html"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function tail(file, n = 40) {
  try {
    const lines = readFileSync(file, "utf8").split("\n");
    return lines.slice(-n).join("\n");
  } catch (err) {
    return `(could not read: ${err.code || err.message})`;
  }
}

try {
  const repoRoot = process.cwd();
  const domainDir = findDomainDir(repoRoot);

  if (!existsSync(join(repoRoot, "server.js"))) {
    log("no server.js in the build — nothing to publish.");
    process.exit(0);
  }
  if (!domainDir) {
    log("not a Hostinger domain layout (no sibling nodejs/ + public_html/) — skipping.");
    process.exit(0);
  }

  const appRoot = join(domainDir, "nodejs");

  // ── Why did the last boot fail? Passenger writes these. ──────────────────
  for (const name of ["stderr.log", "console.log"]) {
    const f = join(appRoot, name);
    if (existsSync(f)) {
      log(`──── tail of nodejs/${name} ────`);
      for (const l of tail(f).split("\n")) log(`  ${l}`);
      log(`──── end nodejs/${name} ────`);
    }
  }

  // ── Copy the built app into the app root ────────────────────────────────
  // Everything the app needs at runtime, and nothing that points back at the
  // build workspace. .git is large and useless here.
  const SKIP = new Set([".git", ".github", ".claude", "tmp", "console.log", "stderr.log", "server.js.pre-publish.bak"]);
  let copied = 0;

  const { readdirSync } = await import("node:fs");
  for (const entry of readdirSync(repoRoot, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const from = join(repoRoot, entry.name);
    const to = join(appRoot, entry.name);
    try {
      // dereference: the root .next is a symlink into apps/grow; the app root
      // must own real files so it survives the build workspace going away.
      rmSync(to, { recursive: true, force: true });
      cpSync(from, to, { recursive: true, dereference: true, force: true });
      copied++;
    } catch (err) {
      log(`could not copy ${entry.name}: ${err.message}`);
    }
  }
  log(`copied ${copied} entries into ${appRoot}`);

  const publishedServer = join(appRoot, "server.js");
  if (existsSync(publishedServer)) {
    log(`app root server.js now ${statSync(publishedServer).mtime.toISOString()}`);
  } else {
    log("WARNING: app root has no server.js after copy — Passenger will not boot.");
  }
  const publishedBuild = join(appRoot, "apps", "grow", ".next", "BUILD_ID");
  log(`app root apps/grow/.next/BUILD_ID present: ${existsSync(publishedBuild)}`);

  const restartDir = join(appRoot, "tmp");
  mkdirSync(restartDir, { recursive: true });
  writeFileSync(join(restartDir, "restart.txt"), new Date().toISOString());
  log("touched tmp/restart.txt — Passenger will restart onto the new build.");
} catch (err) {
  log(`skipped (${err && err.message})`);
}

process.exit(0);
