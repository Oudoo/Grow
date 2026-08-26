import { prisma } from "@/lib/db";

/**
 * Database reachability probe — deliberately SEPARATE from /api/health.
 *
 * /api/health must stay dependency-free (a DB outage must not make a healthy
 * front end look dead). This endpoint answers the different question: "can the
 * app actually talk to its database?" Login needs that, and when it broke the
 * only outward symptom was a generic "Something went wrong" on the form.
 *
 * Returns the driver's error CODE and message only — never the connection
 * string, credentials, host or any row data.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    // Cheapest possible round-trip that proves auth + reachability + schema:
    // counting a table login depends on.
    const users = await prisma.adminUser.count();
    return Response.json(
      { ok: true, adminUsers: users, ms: Date.now() - started },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    const err = e as { code?: string; errorCode?: string; message?: string };
    return Response.json(
      {
        ok: false,
        ms: Date.now() - started,
        code: err.code ?? err.errorCode ?? "unknown",
        // Prisma messages name the failing operation/host but not the password.
        message: (err.message ?? "").split("\n").slice(0, 4).join(" ").slice(0, 400),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
