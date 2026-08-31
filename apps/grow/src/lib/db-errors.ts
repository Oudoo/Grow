/**
 * Classify a database error as "the connection is unusable" versus "your query
 * was wrong".
 *
 * Pure and separate from lib/db.ts so it can be tested directly. Getting this
 * wrong in either direction is costly: too narrow and a dead pool never
 * recovers; too broad and a genuine constraint violation is silently retried,
 * hiding the real cause behind a duplicate failure.
 */

/**
 * Prisma codes that mean the connection itself is at fault.
 *
 *   P1000  authentication failed          (what a Remote MySQL grant change produces)
 *   P1001  cannot reach the database
 *   P1002  connection timed out
 *   P1008  operation timed out
 *   P1017  server closed the connection
 *   P2024  timed out fetching a pooled connection
 */
export const CONNECTION_ERROR_CODES = new Set([
  "P1000", "P1001", "P1002", "P1008", "P1017", "P2024",
]);

/** The same conditions as surfaced by the driver when no Prisma code is attached. */
const CONNECTION_PATTERNS =
  /authentication failed|can'?t reach database|connection closed|server has closed|connection is closed|connection reset|socket has been ended|socket hang ?up|ECONNRESET|ECONNREFUSED|EPIPE|ETIMEDOUT/i;

export function isConnectionFailure(e: unknown): boolean {
  const err = e as { code?: string; message?: string; name?: string } | null | undefined;
  if (!err) return false;
  if (err.code && CONNECTION_ERROR_CODES.has(err.code)) return true;
  // Thrown when Prisma cannot establish a connection at all — including a wrong
  // password, which is precisely the grant-change case.
  if (err.name === "PrismaClientInitializationError") return true;
  return CONNECTION_PATTERNS.test(String(err.message ?? ""));
}
