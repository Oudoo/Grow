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
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
