/**
 * In-process key/value + sorted-set store — a drop-in replacement for the
 * subset of the Redis API the engine actually used (cache, rate-limiting,
 * worker heartbeats, scheduler locks).
 *
 * The unified Grow app runs as a SINGLE Node process (web + in-app worker in
 * one server), so a process-local store is correct: there is no second
 * instance to coordinate with, and it costs nothing to run. State resets on
 * redeploy, which is acceptable for caches, sliding-window counters and
 * short-lived locks (all of which are advisory and self-healing).
 *
 * If the platform is ever scaled horizontally, swap this file for a real
 * Redis/Valkey client implementing the same surface — no call sites change.
 */

type Entry = { value: string; expiresAt: number | null };

class MemoryStore {
  private kv = new Map<string, Entry>();
  private zsets = new Map<string, Map<string, number>>();

  private alive(key: string): Entry | undefined {
    const e = this.kv.get(key);
    if (!e) return undefined;
    if (e.expiresAt !== null && e.expiresAt <= Date.now()) {
      this.kv.delete(key);
      return undefined;
    }
    return e;
  }

  async get(key: string): Promise<string | null> {
    return this.alive(key)?.value ?? null;
  }

  /**
   * Mirrors ioredis `set` with the option tuples the codebase uses:
   *   set(k, v, "EX", seconds) | set(k, v, "PX", ms) | set(k, v, "EX", s, "NX")
   * Returns "OK", or null when an NX set is rejected because the key exists.
   */
  async set(key: string, value: string, ...args: (string | number)[]): Promise<"OK" | null> {
    let expiresAt: number | null = null;
    let nx = false;
    for (let i = 0; i < args.length; i++) {
      const token = String(args[i]).toUpperCase();
      if (token === "EX") expiresAt = Date.now() + Number(args[++i]) * 1000;
      else if (token === "PX") expiresAt = Date.now() + Number(args[++i]);
      else if (token === "NX") nx = true;
    }
    if (nx && this.alive(key)) return null;
    this.kv.set(key, { value: String(value), expiresAt });
    return "OK";
  }

  async incr(key: string): Promise<number> {
    const current = Number(this.alive(key)?.value ?? 0) + 1;
    const prev = this.kv.get(key);
    this.kv.set(key, { value: String(current), expiresAt: prev?.expiresAt ?? null });
    return current;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const e = this.alive(key);
    if (!e) return 0;
    e.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async del(...keys: string[]): Promise<number> {
    let n = 0;
    for (const k of keys) {
      if (this.kv.delete(k)) n++;
      if (this.zsets.delete(k)) n++;
    }
    return n;
  }

  async keys(pattern: string): Promise<string[]> {
    const re = new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
    const out: string[] = [];
    for (const k of this.kv.keys()) if (this.alive(k) && re.test(k)) out.push(k);
    return out;
  }

  async ping(): Promise<"PONG"> {
    return "PONG";
  }

  // --- Sorted sets (sliding-window rate limiter) ---
  private zset(key: string): Map<string, number> {
    let z = this.zsets.get(key);
    if (!z) {
      z = new Map();
      this.zsets.set(key, z);
    }
    return z;
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    const z = this.zset(key);
    const isNew = !z.has(member);
    z.set(member, score);
    return isNew ? 1 : 0;
  }

  async zcard(key: string): Promise<number> {
    return this.zsets.get(key)?.size ?? 0;
  }

  async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    const z = this.zsets.get(key);
    if (!z) return 0;
    let n = 0;
    for (const [member, score] of z) {
      if (score >= min && score <= max) {
        z.delete(member);
        n++;
      }
    }
    return n;
  }

  /** Supports zrange(key, start, stop) and zrange(key, start, stop, "WITHSCORES"). */
  async zrange(key: string, start: number, stop: number, withScores?: string): Promise<string[]> {
    const z = this.zsets.get(key);
    if (!z) return [];
    const sorted = [...z.entries()].sort((a, b) => a[1] - b[1]);
    const end = stop < 0 ? sorted.length + stop + 1 : stop + 1;
    const slice = sorted.slice(start, end);
    if (withScores && withScores.toUpperCase() === "WITHSCORES") {
      return slice.flatMap(([m, s]) => [m, String(s)]);
    }
    return slice.map(([m]) => m);
  }

  /** Minimal MULTI/EXEC: queues calls, returns [[null, result], …] like ioredis. */
  multi(): MemoryMulti {
    return new MemoryMulti(this);
  }
}

class MemoryMulti {
  private ops: Array<() => Promise<unknown>> = [];
  constructor(private store: MemoryStore) {}
  zremrangebyscore(key: string, min: number, max: number) {
    this.ops.push(() => this.store.zremrangebyscore(key, min, max));
    return this;
  }
  zcard(key: string) {
    this.ops.push(() => this.store.zcard(key));
    return this;
  }
  zadd(key: string, score: number, member: string) {
    this.ops.push(() => this.store.zadd(key, score, member));
    return this;
  }
  async exec(): Promise<Array<[null, unknown]>> {
    const results: Array<[null, unknown]> = [];
    for (const op of this.ops) results.push([null, await op()]);
    return results;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __growengine_store: MemoryStore | undefined;
}

/** Shared in-process store (re-used across hot reloads in dev). */
export const redis: MemoryStore = globalThis.__growengine_store ?? new MemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.__growengine_store = redis;
}

/** Simple JSON cache helpers over the store. */
export async function cacheGet<T>(keyName: string): Promise<T | null> {
  const raw = await redis.get(keyName);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function cacheSet(keyName: string, value: unknown, ttlSeconds: number) {
  await redis.set(keyName, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDelete(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
}
