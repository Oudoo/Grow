import { PrismaClient } from '@/generated/prisma';

/**
 * Prisma client.
 *
 * ── Why there is no automatic reconnect layer here ──
 *
 * A previous version wrapped every query in an extension that, on a
 * connection-class error, called $disconnect() and retried once. It was meant to
 * fix a real problem: editing Remote MySQL invalidates this user's sessions, and
 * after a grant change the admin console failed for about two minutes until a
 * deploy happened to restart the app.
 *
 * It made things far worse. The recoverable set included P2024 — "timed out
 * fetching a connection from the pool" — which fires under ordinary load. On
 * that error the layer destroyed the pool that every other in-flight request was
 * waiting on, producing more pool timeouts, producing more disconnects. The
 * result was not a slow console but a total one: every database-touching request
 * hung until the gateway gave up at 504, while the public site kept serving from
 * its bundled fallback and so looked healthy.
 *
 * The lesson is specific and worth keeping: **pool exhaustion is not a broken
 * connection.** Treating a symptom of load as a symptom of a dead socket turns a
 * queue into a collapse. If this is revisited, recovery must exclude P2024 and
 * P1008 entirely, must never tear down a shared pool while requests are queued
 * on it, and needs load testing rather than reasoning.
 *
 * The original problem is self-limiting and follows a deliberate manual action.
 * The mitigation is a one-line operational note: after changing Remote MySQL
 * settings, restart the Node app. See lib/db-errors.ts, which is retained with
 * its tests for whenever this is properly designed.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set in the environment.");
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
