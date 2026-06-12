import { NextResponse } from "next/server";
import { getSystemHealth } from "@growengine/core";
import { auth } from "@/lib/auth";

/**
 * Health endpoint.
 *  - Unauthenticated: light liveness signal for uptime checks and the Grow hub
 *    admin console (no internal topology details exposed).
 *  - Authenticated (tenant session): full system health snapshot for the ops
 *    dashboard (auto-refreshes).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({
      status: "ok",
      system: "the-grow-engine",
      mode: process.env.NODE_ENV === "production" ? "production" : "development",
    });
  }
  const health = await getSystemHealth();
  return NextResponse.json(health);
}
