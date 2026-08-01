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
    { status: "ok", service: "grow-hub", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
