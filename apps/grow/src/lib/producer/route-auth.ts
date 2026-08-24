import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { can, type AccessLevel } from "@/lib/access";
import { isUserActive } from "@/lib/active-check";

/**
 * Route-handler authorization for the Producer API.
 *
 * Middleware already gates /api/producer/* at the 'view' level, but Next.js
 * route handlers are the security boundary for writes: they must independently
 * require 'manage'. This returns a ready-to-send 401/403 NextResponse when the
 * caller is not allowed, or null when they may proceed.
 *
 *   const denied = await guardProducer("manage");
 *   if (denied) return denied;
 */
export async function guardProducer(level: AccessLevel = "manage"): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, session.access, "producer", level)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Live account-status check — a deactivated/deleted account is rejected
  // immediately, not at cookie expiry.
  if (!(await isUserActive(session.uid))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
