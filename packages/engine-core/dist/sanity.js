import { z } from "zod";
/**
 * Sanity Check Engine — validates incoming provider data, detects
 * anomalies against history, and verifies derived calculations before
 * anything is stored or surfaced.
 */
export const incomingMetricSchema = z.object({
    metric: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    value: z.number().finite(),
    currency: z.string().length(3).optional(),
    dimensions: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
    sourceRequestId: z.string().optional(),
    sourceReferenceUrl: z.string().url().optional(),
});
/** Non-negative-only metrics — negative values indicate a provider bug. */
const NON_NEGATIVE_METRICS = new Set([
    "spend",
    "impressions",
    "clicks",
    "conversions",
    "revenue",
    "sessions",
    "leads",
    "reach",
    "video_views",
]);
export function validateIncomingMetric(raw) {
    const parsed = incomingMetricSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            ok: false,
            findings: parsed.error.issues.map((i) => ({
                level: "error",
                check: "schema_validation",
                message: `${i.path.join(".")}: ${i.message}`,
            })),
        };
    }
    const findings = [];
    const m = parsed.data;
    if (NON_NEGATIVE_METRICS.has(m.metric) && m.value < 0) {
        findings.push({
            level: "error",
            check: "non_negative",
            message: `${m.metric} cannot be negative (got ${m.value})`,
            metric: m.metric,
            date: m.date,
        });
    }
    const d = new Date(m.date);
    if (d.getTime() > Date.now() + 24 * 3600 * 1000) {
        findings.push({
            level: "error",
            check: "future_date",
            message: `Data point dated in the future: ${m.date}`,
            metric: m.metric,
            date: m.date,
        });
    }
    return { ok: !findings.some((f) => f.level === "error"), data: m, findings };
}
/**
 * Anomaly detection — modified z-score against the trailing history.
 * Flags values >3.5 MAD-z as warnings (could be real spikes, never blocked).
 */
export function detectAnomaly(value, history, metric, date) {
    if (history.length < 7)
        return null;
    const sorted = [...history].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const deviations = history.map((h) => Math.abs(h - median));
    const sortedDev = deviations.sort((a, b) => a - b);
    const mad = sortedDev[Math.floor(sortedDev.length / 2)] || 1e-9;
    const modifiedZ = (0.6745 * (value - median)) / mad;
    if (Math.abs(modifiedZ) > 3.5) {
        return {
            level: "warning",
            check: "anomaly_detection",
            message: `${metric} on ${date} deviates ${modifiedZ.toFixed(1)} MAD-z from the trailing median (${median.toFixed(2)})`,
            metric,
            date,
        };
    }
    return null;
}
/**
 * Calculation verification — re-derives computed metrics from their
 * components and flags discrepancies beyond rounding tolerance.
 */
export function verifyCalculation(name, reported, computed, tolerancePct = 1) {
    if (computed === 0 && reported === 0)
        return null;
    const denominator = Math.max(Math.abs(computed), 1e-9);
    const diffPct = (Math.abs(reported - computed) / denominator) * 100;
    if (diffPct > tolerancePct) {
        return {
            level: "warning",
            check: "calculation_verification",
            message: `${name}: reported ${reported.toFixed(4)} differs from computed ${computed.toFixed(4)} by ${diffPct.toFixed(2)}%`,
        };
    }
    return null;
}
export function summarizeFindings(findings) {
    if (findings.some((f) => f.level === "error"))
        return { status: "failed", findings };
    if (findings.some((f) => f.level === "warning"))
        return { status: "warning", findings };
    return { status: "passed", findings };
}
//# sourceMappingURL=sanity.js.map