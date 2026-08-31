import { PrismaClient } from '@/generated/prisma';
import { isConnectionFailure } from './db-errors';

/**
 * Prisma client, with automatic recovery from a dead connection pool.
 *
 * **Why the recovery layer exists.** Editing Remote MySQL access — adding or
 * revoking a host — makes MySQL invalidate this user's existing sessions. The
 * pooled connections are then dead, but Prisma keeps handing them out, so every
 * query fails with an authentication error until the process restarts. Observed
 * on 2026-08-31: a grant change caused roughly two minutes of total admin
 * failure, and it only cleared because a deploy happened to restart the app.
 * Without that restart it would have stayed broken indefinitely.
 *
 * The fix is to notice that class of error and retire the pool, so the next
 * attempt opens a fresh connection. One retry, with a cooldown, so a database
 * that is genuinely down does not turn every query into a reconnect storm.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof build> | undefined;
};

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set in the environment.");
}

/**
 * Minimum gap between reconnect attempts. A burst of concurrent queries hitting
 * a dead pool would otherwise each call $disconnect(), fighting each other and
 * making recovery slower rather than faster.
 */
const RECONNECT_COOLDOWN_MS = 5_000;

function build() {
  const base = new PrismaClient();
  let lastReconnect = 0;
  let reconnecting: Promise<void> | null = null;

  /** Retire the pool. Concurrent callers share one attempt. */
  async function recycle(): Promise<boolean> {
    const now = Date.now();
    if (reconnecting) {
      await reconnecting;
      return true;
    }
    if (now - lastReconnect < RECONNECT_COOLDOWN_MS) return false;

    lastReconnect = now;
    reconnecting = (async () => {
      try {
        // $disconnect drops the pool; Prisma reconnects lazily on the next
        // query, which is exactly the behaviour we want here.
        await base.$disconnect();
        console.warn("[db] connection pool was unusable — retired it; reconnecting on next query.");
      } catch (e) {
        console.error("[db] could not retire the pool:", e);
      } finally {
        reconnecting = null;
      }
    })();
    await reconnecting;
    return true;
  }

  return base.$extends({
    query: {
      async $allOperations({ query, args }) {
        try {
          return await query(args);
        } catch (e) {
          if (!isConnectionFailure(e)) throw e;
          // One retry only. If the second attempt also fails the caller sees
          // the real error, and /api/health/db reports it accurately.
          if (!(await recycle())) throw e;
          return await query(args);
        }
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? build();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
