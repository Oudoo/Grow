/**
 * Liveness probe for external uptime monitoring.
 *
 * Deliberately touches NOTHING — no database, no session, no queue. It answers
 * exactly one question: "is the web server up and serving?" That is the thing
 * that must never be false, and keeping the check dependency-free means a
 * database outage cannot make a healthy front end look dead (or page anyone at
 * 3am for something that is not actually user-facing).
 *
 * Point an uptime monitor at https://growcdx.com/api/health.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "grow-hub",
      time: new Date().toISOString(),
      // Presence-only configuration flags — never the values. Reading process.env
      // keeps this probe dependency-free. These exist because a missing
      // AUTH_SECRET makes every login fail (auth.ts refuses an insecure
      // fallback in production), and that was previously invisible from outside:
      // the login form showed only a generic "Something went wrong".
      // Safe to expose: production either has a real secret or fails closed, so
      // `false` reveals a misconfiguration without enabling session forgery.
      config: {
        authSecret: Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16),
        databaseUrl: Boolean(process.env.DATABASE_URL),
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        // Mail and scheduler, presence only — same reasoning as above, learned
        // again on 2026-09-02. /api/health/mail answers this properly but needs
        // an admin session, so from outside the box there was no way to tell
        // "the settings were added to a .grow.env nothing reads" from "one key
        // is missing or misspelt". Both look like a silent 401 or no email.
        smtpHost: Boolean(process.env.SMTP_HOST),
        smtpUser: Boolean(process.env.SMTP_USER),
        smtpPass: Boolean(process.env.SMTP_PASS),
        cronSecret: Boolean(process.env.CRON_SECRET),
        // Which .grow.env was loaded — "domain", "home", "other", or absent
        // when none was found. Set by server.js; never the path.
        envSource: process.env.GROW_ENV_SOURCE ?? null,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
