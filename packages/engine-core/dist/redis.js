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
class MemoryStore {
    kv = new Map();
    zsets = new Map();
    alive(key) {
        const e = this.kv.get(key);
        if (!e)
            return undefined;
        if (e.expiresAt !== null && e.expiresAt <= Date.now()) {
            this.kv.delete(key);
            return undefined;
        }
        return e;
    }
    async get(key) {
        return this.alive(key)?.value ?? null;
    }
    /**
     * Mirrors ioredis `set` with the option tuples the codebase uses:
     *   set(k, v, "EX", seconds) | set(k, v, "PX", ms) | set(k, v, "EX", s, "NX")
     * Returns "OK", or null when an NX set is rejected because the key exists.
     */
    async set(key, value, ...args) {
        let expiresAt = null;
        let nx = false;
        for (let i = 0; i < args.length; i++) {
            const token = String(args[i]).toUpperCase();
            if (token === "EX")
                expiresAt = Date.now() + Number(args[++i]) * 1000;
            else if (token === "PX")
                expiresAt = Date.now() + Number(args[++i]);
            else if (token === "NX")
                nx = true;
        }
        if (nx && this.alive(key))
            return null;
        this.kv.set(key, { value: String(value), expiresAt });
        return "OK";
    }
    async incr(key) {
        const current = Number(this.alive(key)?.value ?? 0) + 1;
        const prev = this.kv.get(key);
        this.kv.set(key, { value: String(current), expiresAt: prev?.expiresAt ?? null });
        return current;
    }
    async expire(key, seconds) {
        const e = this.alive(key);
        if (!e)
            return 0;
        e.expiresAt = Date.now() + seconds * 1000;
        return 1;
    }
    async del(...keys) {
        let n = 0;
        for (const k of keys) {
            if (this.kv.delete(k))
                n++;
            if (this.zsets.delete(k))
                n++;
        }
        return n;
    }
    async keys(pattern) {
        const re = new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
        const out = [];
        for (const k of this.kv.keys())
            if (this.alive(k) && re.test(k))
                out.push(k);
        return out;
    }
    async ping() {
        return "PONG";
    }
    // --- Sorted sets (sliding-window rate limiter) ---
    zset(key) {
        let z = this.zsets.get(key);
        if (!z) {
            z = new Map();
            this.zsets.set(key, z);
        }
        return z;
    }
    async zadd(key, score, member) {
        const z = this.zset(key);
        const isNew = !z.has(member);
        z.set(member, score);
        return isNew ? 1 : 0;
    }
    async zcard(key) {
        return this.zsets.get(key)?.size ?? 0;
    }
    async zremrangebyscore(key, min, max) {
        const z = this.zsets.get(key);
        if (!z)
            return 0;
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
    async zrange(key, start, stop, withScores) {
        const z = this.zsets.get(key);
        if (!z)
            return [];
        const sorted = [...z.entries()].sort((a, b) => a[1] - b[1]);
        const end = stop < 0 ? sorted.length + stop + 1 : stop + 1;
        const slice = sorted.slice(start, end);
        if (withScores && withScores.toUpperCase() === "WITHSCORES") {
            return slice.flatMap(([m, s]) => [m, String(s)]);
        }
        return slice.map(([m]) => m);
    }
    /** Minimal MULTI/EXEC: queues calls, returns [[null, result], …] like ioredis. */
    multi() {
        return new MemoryMulti(this);
    }
}
class MemoryMulti {
    store;
    ops = [];
    constructor(store) {
        this.store = store;
    }
    zremrangebyscore(key, min, max) {
        this.ops.push(() => this.store.zremrangebyscore(key, min, max));
        return this;
    }
    zcard(key) {
        this.ops.push(() => this.store.zcard(key));
        return this;
    }
    zadd(key, score, member) {
        this.ops.push(() => this.store.zadd(key, score, member));
        return this;
    }
    async exec() {
        const results = [];
        for (const op of this.ops)
            results.push([null, await op()]);
        return results;
    }
}
/** Shared in-process store (re-used across hot reloads in dev). */
export const redis = globalThis.__growengine_store ?? new MemoryStore();
if (process.env.NODE_ENV !== "production") {
    globalThis.__growengine_store = redis;
}
/** Simple JSON cache helpers over the store. */
export async function cacheGet(keyName) {
    const raw = await redis.get(keyName);
    return raw ? JSON.parse(raw) : null;
}
export async function cacheSet(keyName, value, ttlSeconds) {
    await redis.set(keyName, JSON.stringify(value), "EX", ttlSeconds);
}
export async function cacheDelete(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length)
        await redis.del(...keys);
}
//# sourceMappingURL=redis.js.map