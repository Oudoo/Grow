import { NextRequest } from "next/server";
import { dispatchPendingEmails } from "@/lib/notify";
import { sweepDueDates } from "@/lib/reminders";
import { isMailConfigured } from "@/lib/mail";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";

/**
 * Notification dispatcher — the scheduled half of the notification system.
 *
 * Does two things, in order:
 *   1. Sweeps due dates, queueing reminders for tasks that are due soon or late.
 *   2. Drains the email outbox, sending whatever is queued.
 *
 * Run it every 15 minutes from Hostinger's cron:
 *   curl -fsS -H "x-cron-secret: $CRON_SECRET" https://growcdx.com/api/notifications/dispatch
 *
 * Authorisation accepts either a shared secret (for cron) or an authenticated
 * session with projects:manage (so an admin can force a run from a browser and
 * see the result). Without CRON_SECRET set, only the session path works —
 * failing closed rather than leaving an unauthenticated trigger exposed.
 */
export const dynamic = "force-dynamic";

async function authorise(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided =
      request.headers.get("x-cron-secret") ??
      request.nextUrl.searchParams.get("secret") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided && provided === secret) return true;
  }

  const session = await getSession();
  return !!session && can(session.role, session.access, "projects", "manage");
}

async function run(request: NextRequest) {
  if (!(await authorise(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const reminders = await sweepDueDates();
  // A generous batch: the sweep may have just queued a burst of reminders, and
  // shared-host cron runs are infrequent enough that a small cap would lag.
  const email = await dispatchPendingEmails(100);

  return Response.json(
    {
      ok: true,
      ms: Date.now() - started,
      mailConfigured: isMailConfigured(),
      reminders,
      email,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: NextRequest) {
  return run(request);
}

// POST is the semantically correct verb for a job that mutates state; GET is
// kept because most shared-host cron runners can only issue a plain curl.
export async function POST(request: NextRequest) {
  return run(request);
}
