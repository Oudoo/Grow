export declare class RateLimitError extends Error {
    provider: string;
    retryAfterMs: number;
    constructor(provider: string, retryAfterMs: number);
}
/** Acquire a request slot or throw RateLimitError with a retry hint. */
export declare function acquireSlot(provider: string, tenantId: string): Promise<void>;
/** Record a provider 429/throttle and set exponential backoff. */
export declare function recordThrottle(provider: string, tenantId: string): Promise<number>;
export declare function clearBackoff(provider: string, tenantId: string): Promise<void>;
/**
 * Rate-limited fetch wrapper used by every integration connector.
 * Retries on 429/5xx with provider-aware backoff and surfaces the
 * provider request id for the Verifiable Data Layer.
 */
export declare function rateLimitedFetch(provider: string, tenantId: string, url: string, init?: RequestInit, maxRetries?: number): Promise<{
    response: Response;
    requestId: string | null;
}>;
//# sourceMappingURL=rate-limiter.d.ts.map