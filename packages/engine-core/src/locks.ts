import { hostname } from "node:os";
import { eq, lt, and, sql } from "drizzle-orm";
import { db, schedulerLocks } from "@growengine/db";
import { redis } from "./redis.js";

/**
 * A lock that holds across processes.
 *
 * Passenger runs more than one copy of this app (the runtime log shows two
 * boots interleaving on every deploy and a third instance spawned under load
 * on 2026-09-13). The in-memory store behind `redis` is per process, so an
 * in-memory lock only ever excluded a process from itself: every copy ran the
 * scheduler's daily tick, and every copy would have enqueued the daily AI
 * jobs once a provider key existed.
 *
 * The lock is a row in scheduler_locks: expired rows are swept, then an
 * INSERT either succeeds (acquired) or hits the primary key (someone else
 * holds it). No polling, no leases to renew — a holder that dies simply lets
 * the row expire. If the database is unreachable the in-memory lock is used
 * instead, so a lock can never be the reason scheduled work stops entirely.
 */

export const LOCK_OWNER = `${hostname()}:${process.pid}`;

export async function acquireDbLock(key: string, ttlSeconds: number, owner = LOCK_OWNER): Promise<boolean> {
  const now = new Date();
  try {
    await db.delete(schedulerLocks).where(lt(schedulerLocks.expiresAt, now));
    await db.insert(schedulerLocks).values({
      lockKey: key,
      owner,
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
    });
    return true;
  } catch (err) {
    const errno = Number((err as { errno?: number }).errno ?? (err as { cause?: { errno?: number } }).cause?.errno);
    if (errno === 1062) return false; // ER_DUP_ENTRY — held by another process
    // Table missing on a fresh database before migration 0004, or the DB is
    // down: fall back to the process-local lock rather than skipping the work.
    const local = await redis.set(`lock:${key}`, owner, "EX", ttlSeconds, "NX");
    return local === "OK";
  }
}

export async function releaseDbLock(key: string, owner = LOCK_OWNER): Promise<void> {
  try {
    await db.delete(schedulerLocks).where(and(eq(schedulerLocks.lockKey, key), eq(schedulerLocks.owner, owner)));
  } catch {
    await redis.del(`lock:${key}`);
  }
}

/** Run `fn` only if this process wins the lock; the lock is held for the TTL, not released after. */
export async function withDbLock(key: string, ttlSeconds: number, fn: () => Promise<void>): Promise<boolean> {
  if (!(await acquireDbLock(key, ttlSeconds))) return false;
  await fn();
  return true;
}

/** Who holds what right now — for the Developer console. */
export async function listDbLocks() {
  return db
    .select()
    .from(schedulerLocks)
    .where(sql`${schedulerLocks.expiresAt} >= now()`)
    .orderBy(schedulerLocks.lockKey);
}
