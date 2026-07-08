import { z } from "zod";
/**
 * Sanity Check Engine — validates incoming provider data, detects
 * anomalies against history, and verifies derived calculations before
 * anything is stored or surfaced.
 */
export declare const incomingMetricSchema: z.ZodObject<{
    metric: z.ZodString;
    date: z.ZodString;
    value: z.ZodNumber;
    currency: z.ZodOptional<z.ZodString>;
    dimensions: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
    sourceRequestId: z.ZodOptional<z.ZodString>;
    sourceReferenceUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    metric: string;
    value: number;
    dimensions: Record<string, string | number>;
    currency?: string | undefined;
    sourceRequestId?: string | undefined;
    sourceReferenceUrl?: string | undefined;
}, {
    date: string;
    metric: string;
    value: number;
    currency?: string | undefined;
    dimensions?: Record<string, string | number> | undefined;
    sourceRequestId?: string | undefined;
    sourceReferenceUrl?: string | undefined;
}>;
export type IncomingMetric = z.infer<typeof incomingMetricSchema>;
export interface SanityFinding {
    level: "info" | "warning" | "error";
    check: string;
    message: string;
    metric?: string;
    date?: string;
}
export interface SanityResult {
    status: "passed" | "warning" | "failed";
    findings: SanityFinding[];
}
export declare function validateIncomingMetric(raw: unknown): {
    ok: boolean;
    data?: IncomingMetric;
    findings: SanityFinding[];
};
/**
 * Anomaly detection — modified z-score against the trailing history.
 * Flags values >3.5 MAD-z as warnings (could be real spikes, never blocked).
 */
export declare function detectAnomaly(value: number, history: number[], metric: string, date: string): SanityFinding | null;
/**
 * Calculation verification — re-derives computed metrics from their
 * components and flags discrepancies beyond rounding tolerance.
 */
export declare function verifyCalculation(name: string, reported: number, computed: number, tolerancePct?: number): SanityFinding | null;
export declare function summarizeFindings(findings: SanityFinding[]): SanityResult;
//# sourceMappingURL=sanity.d.ts.map