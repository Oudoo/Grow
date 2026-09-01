#!/usr/bin/env node
/**
 * Uptime monitor for the database path, run from cron.
 *
 * WHY THIS ENDPOINT. `/api/health` is deliberately dependency-free, so it stayed
 * green through a total login outage on 2026-09-01 — the database was
 * unreachable and the liveness probe never noticed. Anything watching this app
 * has to watch `/api/health/db`, which actually issues a query.
 *
 * WHY CRON RATHER THAN IN-APP. A watchdog inside the process it watches cannot
 * report that the process is wedged. Cron runs independently: if Passenger is
 * hung or the app cannot reach MySQL, this still fires.
 *
 * WHAT IT DELIBERATELY DOES NOT DO. It never restarts anything. Two attempts at
 * automatic recovery today each caused a worse outage than the fault they
 * targeted; the job here is to *tell a human quickly*, which is the part that was
 * actually missing.
 *
 * Alerts go out over Twilio WhatsApp when configured, and are always appended to
 * a log outside the deploy directory so history survives a release.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const URL_TO_CHECK = process.env.HEALTH_URL || "https://growcdx.com/api/health/db";
const TIMEOUT_MS = 20_000;

/** Don't re-alert more often than this while an outage continues. */
const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

/** Consecutive failures before alerting — absorbs a single blip or a redeploy. */
const FAILURES_BEFORE_ALERT = 2;

// ── persistent state, outside the deploy directory so a release keeps it ──
function stateDir() {
  const candidates = [
    process.env.MONITOR_DIR,
    path.join(process.cwd(), "..", "..", "monitor"),
    path.join(os.homedir(), ".grow-monitor"),
  ].filter(Boolean);
  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o750 });
      return dir;
    } catch {
      /* try the next candidate */
    }
  }
  return os.tmpdir();
}

const DIR = stateDir();
const STATE_FILE = path.join(DIR, "state.json");
const LOG_FILE = path.join(DIR, "health.log");

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { consecutiveFailures: 0, lastAlertAt: 0, down: false };
  }
}

function writeState(s) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(s), { mode: 0o640 });
  } catch (e) {
    log(`could not persist state: ${e.message}`);
  }
}

function log(line) {
  const entry = `${new Date().toISOString()}  ${line}\n`;
  try {
    fs.appendFileSync(LOG_FILE, entry, { mode: 0o640 });
  } catch {
    /* nothing useful to do if even the log is unwritable */
  }
  process.stdout.write(entry);
}

/** Load .grow.env so Twilio credentials are available under cron. */
function loadEnv() {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, ".grow.env");
    if (fs.existsSync(candidate)) {
      for (const raw of fs.readFileSync(candidate, "utf8").split("\n")) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        // Do not clobber anything cron already set.
        if (!process.env[key]) {
          process.env[key] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        }
      }
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

async function sendWhatsApp(message) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.GROW_ALERT_WHATSAPP_TO || process.env.GROW_SALES_WHATSAPP_TO;

  if (!sid || !token || !from || !to) {
    log("ALERT NOT SENT — Twilio/WhatsApp not configured (need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, GROW_ALERT_WHATSAPP_TO)");
    return false;
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: message }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      log(`ALERT FAILED — Twilio ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return false;
    }
    log("alert sent over WhatsApp");
    return true;
  } catch (e) {
    log(`ALERT FAILED — ${e.message}`);
    return false;
  }
}

async function check() {
  try {
    const res = await fetch(URL_TO_CHECK, {
      headers: { "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await res.text();
    if (!res.ok) {
      // An error page is usually HTML; a log full of markup is unreadable, and
      // the status code plus a short excerpt is all that is diagnostic.
      const excerpt = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
      return { ok: false, detail: `HTTP ${res.status}${excerpt ? " — " + excerpt : ""}` };
    }
    try {
      const json = JSON.parse(body);
      if (json.ok !== true) return { ok: false, detail: `ok=false code=${json.code ?? "?"}` };
      return { ok: true, detail: `host=${json.host ?? "?"} ms=${json.ms ?? "?"}` };
    } catch {
      return { ok: false, detail: "response was not JSON" };
    }
  } catch (e) {
    // A timeout or a refused connection is exactly the condition worth alerting
    // on — it is what a 504 looks like from outside.
    return { ok: false, detail: e.name === "TimeoutError" ? "timed out" : e.message };
  }
}

async function main() {
  loadEnv();
  const state = readState();
  const result = await check();

  if (result.ok) {
    if (state.down) {
      log(`RECOVERED — ${result.detail}`);
      await sendWhatsApp(`GROW is back up. Database reachable again (${result.detail}).`);
    }
    writeState({ consecutiveFailures: 0, lastAlertAt: 0, down: false });
    return;
  }

  const failures = (state.consecutiveFailures || 0) + 1;
  log(`FAIL (${failures}) — ${result.detail}`);

  const now = Date.now();
  const shouldAlert =
    failures >= FAILURES_BEFORE_ALERT && now - (state.lastAlertAt || 0) > ALERT_COOLDOWN_MS;

  if (shouldAlert) {
    await sendWhatsApp(
      `GROW ALERT: the admin database is unreachable.\n\n` +
        `${result.detail}\n\n` +
        `Staff login will fail with "Cannot reach the accounts database".\n` +
        `Check https://growcdx.com/api/health/db — the public site is unaffected.`
    );
    writeState({ consecutiveFailures: failures, lastAlertAt: now, down: true });
    return;
  }

  writeState({ consecutiveFailures: failures, lastAlertAt: state.lastAlertAt || 0, down: state.down || false });
}

main().catch((e) => log(`monitor crashed: ${e.message}`));
