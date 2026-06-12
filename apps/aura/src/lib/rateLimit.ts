// Lightweight in-memory rate limiter.
//
// NOTE: state lives in the process, so it resets on restart and is per-instance
// (it won't coordinate across multiple serverless instances). It's a pragmatic
// first line of defense against spam/brute-force on a single-node deployment;
// move to a shared store (e.g. Redis) if you scale horizontally.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Records a hit for `key` and reports whether it is within `max` hits per
 * `windowMs`. Namespace keys per feature, e.g. `audit:${ip}`.
 */
export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfterMs: 0 };
  }

  bucket.count += 1;
  const allowed = bucket.count <= max;
  return {
    allowed,
    remaining: Math.max(0, max - bucket.count),
    retryAfterMs: allowed ? 0 : bucket.resetAt - now,
  };
}

/** Extracts the client IP from forwarded headers, falling back to "unknown". */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
