import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";
import { readMailConfig, verifyMailConnection } from "@/lib/mail";
import { prisma } from "@/lib/db";

/**
 * SMTP reachability probe.
 *
 * Separate from /api/health (which must stay dependency-free) and from
 * /api/health/db. Answers: "can this app actually send email, and is anything
 * stuck in the outbox?" — the two questions you have when someone says they
 * never got a notification.
 *
 * Unlike the other probes this one requires an authenticated admin: it reports
 * the mail host and username, which are not secrets but are not worth handing
 * to anonymous callers either. The password is never included.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || !can(session.role, session.access, "iam", "view")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = readMailConfig();
  if (!cfg) {
    return Response.json(
      {
        ok: false,
        configured: false,
        message:
          "SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in .grow.env. " +
          "Notifications still appear in-app and will be emailed once these are set.",
        missing: [
          !process.env.SMTP_HOST && "SMTP_HOST",
          !process.env.SMTP_USER && "SMTP_USER",
          !process.env.SMTP_PASS && "SMTP_PASS",
        ].filter(Boolean),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const started = Date.now();
  const verified = await verifyMailConnection();

  // Outbox depth tells you whether mail is merely slow or actually stuck.
  let queued = 0;
  let failed = 0;
  try {
    [queued, failed] = await Promise.all([
      prisma.notification.count({ where: { emailedAt: null, emailAttempts: { lt: 3 } } }),
      prisma.notification.count({ where: { emailedAt: null, emailAttempts: { gte: 3 } } }),
    ]);
  } catch {
    // A database problem is already reported by /api/health/db — don't
    // duplicate the diagnosis, just leave the counts at zero.
  }

  return Response.json(
    {
      ok: verified.ok,
      configured: true,
      ms: Date.now() - started,
      // Host/user/from only — the password is never read into this response.
      transport: { host: cfg.host, port: cfg.port, secure: cfg.secure, user: cfg.user, from: cfg.from },
      outbox: { queued, givenUp: failed },
      error: verified.error,
    },
    { status: verified.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
