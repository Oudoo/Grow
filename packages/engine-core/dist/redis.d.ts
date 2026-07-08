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
declare class MemoryStore {
    private kv;
    private zsets;
    private alive;
    get(key: string): Promise<string | null>;
    /**
     * Mirrors ioredis `set` with the option tuples the codebase uses:
     *   set(k, v, "EX", seconds) | set(k, v, "PX", ms) | set(k, v, "EX", s, "NX")
     * Returns "OK", or null when an NX set is rejected because the key exists.
     */
    set(key: string, value: string, ...args: (string | number)[]): Promise<"OK" | null>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    del(...keys: string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    ping(): Promise<"PONG">;
    private zset;
    zadd(key: string, score: number, member: string): Promise<number>;
    zcard(key: string): Promise<number>;
    zremrangebyscore(key: string, min: number, max: number): Promise<number>;
    /** Supports zrange(key, start, stop) and zrange(key, start, stop, "WITHSCORES"). */
    zrange(key: string, start: number, stop: number, withScores?: string): Promise<string[]>;
    /** Minimal MULTI/EXEC: queues calls, returns [[null, result], …] like ioredis. */
    multi(): MemoryMulti;
}
declare class MemoryMulti {
    private store;
    private ops;
    constructor(store: MemoryStore);
    zremrangebyscore(key: string, min: number, max: number): this;
    zcard(key: string): this;
    zadd(key: string, score: number, member: string): this;
    exec(): Promise<Array<[null, unknown]>>;
}
declare global {
    var __growengine_store: MemoryStore | undefined;
}
/** Shared in-process store (re-used across hot reloads in dev). */
export declare const redis: MemoryStore;
/** Simple JSON cache helpers over the store. */
export declare function cacheGet<T>(keyName: string): Promise<T | null>;
export declare function cacheSet(keyName: string, value: unknown, ttlSeconds: number): Promise<void>;
export declare function cacheDelete(pattern: string): Promise<void>;
export {};
//# sourceMappingURL=redis.d.ts.map