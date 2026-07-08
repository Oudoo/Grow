/**
 * System Health Dashboard data source — worker status, queue depth,
 * failed jobs, database and Redis health.
 */
export interface SystemHealth {
    database: {
        ok: boolean;
        latencyMs: number;
    };
    redis: {
        ok: boolean;
        latencyMs: number;
    };
    queues: Record<string, {
        waiting: number;
        active: number;
        failed: number;
        delayed: number;
        completed: number;
    }>;
    workers: {
        name: string;
        lastHeartbeat: string | null;
        healthy: boolean;
    }[];
    checkedAt: string;
}
export declare function getSystemHealth(): Promise<SystemHealth>;
/** Workers call this every 30s. */
export declare function recordHeartbeat(workerName: string): Promise<void>;
//# sourceMappingURL=health.d.ts.map