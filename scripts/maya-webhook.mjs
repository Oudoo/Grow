#!/usr/bin/env node
/**
 * Register GROW's webhook with the Vexa account Maya rides in on.
 *
 *   VEXA_API_KEY=… VEXA_WEBHOOK_SECRET=… node scripts/maya-webhook.mjs https://growcdx.com/api/webhooks/vexa
 *
 * One call per Vexa account. The secret must be the same value the app has in
 * .grow.env, because /api/webhooks/vexa verifies every delivery against it.
 * Pass an empty URL ("") to clear the webhook.
 */
const url = process.argv[2];
const key = process.env.VEXA_API_KEY;
const secret = process.env.VEXA_WEBHOOK_SECRET;
const base = (process.env.VEXA_API_URL ?? "https://api.cloud.vexa.ai").replace(/\/+$/, "");

if (url === undefined || !key || !secret) {
  console.error("usage: VEXA_API_KEY=… VEXA_WEBHOOK_SECRET=… node scripts/maya-webhook.mjs <webhook url>");
  process.exit(2);
}

const res = await fetch(`${base}/user/webhook`, {
  method: "PUT",
  headers: { "X-API-Key": key, "Content-Type": "application/json" },
  body: JSON.stringify({
    webhook_url: url,
    webhook_secret: secret,
    webhook_events: { "meeting.completed": true, "bot.failed": true, "meeting.started": true },
  }),
});
const text = await res.text();
console.log(`${res.status} ${res.statusText}\n${text}`);
process.exit(res.ok ? 0 : 1);
