import "server-only";
import { prisma } from "./db";

/**
 * Live account-status check for server-side guards.
 *
 * Sessions are stateless 7-day HMAC cookies, so without this a user deactivated
 * or deleted in the IAM portal would keep working until their cookie expired.
 * Server guards call this so a deactivation takes effect on the very next
 * guarded action or page.
 *
 * Fail-open on infrastructure errors: if the database is unreachable we do NOT
 * lock every admin out — we only reject when the row is definitively missing
 * (deleted) or isActive is false (deactivated).
 */
export async function isUserActive(uid: string): Promise<boolean> {
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: uid },
      select: { isActive: true },
    });
    if (!user) return false; // deleted
    return user.isActive;    // deactivated when false
  } catch {
    return true; // DB unreachable — don't lock everyone out
  }
}
