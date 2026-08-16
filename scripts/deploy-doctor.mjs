#!/usr/bin/env node
/**
 * TEMPORARY deploy diagnostic — safe to delete once growcdx.com deploys cleanly.
 *
 * Runs at the end of the server build and prints, to the build log, where the
 * build actually happened and what the Passenger app root contains. We need
 * this because from the outside the deploy looks perfect — the build succeeds,
 * the document root's BUILD_ID updates — yet the process serving traffic keeps
 * running an old app. The document root's .htaccess points Passenger at
 * <domain>/nodejs with startup file server.js, and nothing in the deploy
 * appears to update that directory.
 *
 * Read-only. Never throws, never changes the build's exit status.
 */
import { existsSync, readdirSync, statSync, accessSync, constants } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const line = (s = "") => console.log(`[doctor] ${s}`);

function ls(dir, limit = 40) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const shown = entries.slice(0, limit).map((e) => {
      const kind = e.isDirectory() ? "dir " : e.isSymbolicLink() ? "link" : "file";
      return `    ${kind}  ${e.name}`;
    });
    return [`  ${dir}  (${entries.length} entries)`, ...shown];
  } catch (err) {
    return [`  ${dir}  -- ${err.code || err.message}`];
  }
}

function writable(dir) {
  try {
    accessSync(dir, constants.W_OK);
    return "WRITABLE";
  } catch {
    return "not writable";
  }
}

try {
  line("================ DEPLOY DOCTOR ================");
  line(`cwd:  ${process.cwd()}`);
  line(`home: ${homedir()}`);
  line(`node: ${process.version}`);
  line();

  line("build workspace (cwd):");
  ls(process.cwd()).forEach(line);
  line();

  const built = join(process.cwd(), "apps", "grow", ".next", "BUILD_ID");
  line(`apps/grow/.next/BUILD_ID exists: ${existsSync(built)}`);
  line(`server.js in cwd: ${existsSync(join(process.cwd(), "server.js"))}`);
  line();

  // Walk up to the domain folder and inspect the Passenger app root.
  const domainDir = "/home/u454713534/domains/growcdx.com";
  for (const dir of [domainDir, join(domainDir, "nodejs"), join(domainDir, "public_html")]) {
    line(`--- ${dir} [${existsSync(dir) ? writable(dir) : "MISSING"}] ---`);
    if (existsSync(dir)) ls(dir).forEach(line);
    line();
  }

  const appRootBuild = join(domainDir, "nodejs", ".next", "BUILD_ID");
  if (existsSync(appRootBuild)) {
    line(`nodejs/.next/BUILD_ID mtime: ${statSync(appRootBuild).mtime.toISOString()}`);
  } else {
    line("nodejs/.next/BUILD_ID: MISSING");
  }
  const appServer = join(domainDir, "nodejs", "server.js");
  line(`nodejs/server.js exists: ${existsSync(appServer)}`);
  if (existsSync(appServer)) {
    line(`nodejs/server.js mtime: ${statSync(appServer).mtime.toISOString()}`);
  }
  line("============== END DEPLOY DOCTOR ==============");
} catch (err) {
  line(`doctor failed (ignored): ${err && err.message}`);
}

process.exit(0);
