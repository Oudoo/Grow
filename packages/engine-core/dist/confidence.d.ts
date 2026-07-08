/**
 * AI Confidence Framework — every forecast, DMAIC output, recommendation
 * and quantified insight carries a confidence score, the data sources used
 * and an evidence count. Scores are computed from measurable signals, not
 * model self-reports.
 */
export interface ConfidenceInput {
    /** Number of independent supporting data points / evidence items */
    evidenceCount: number;
    /** Days of history backing the analysis */
    dataWindowDays: number;
    /** Hours since the most recent underlying data point */
    dataFreshnessHours: number;
    /** Coefficient of variation of the underlying series (0 = perfectly stable) */
    variability?: number;
    /** Backtest accuracy when available (MAPE, lower is better) */
    backtestMape?: number;
    /** Fraction of records that passed the Sanity Check Engine (0-1) */
    sanityPassRate?: number;
    /** Distinct data sources (providers) corroborating */
    sourceCount?: number;
}
export interface ConfidenceResult {
    /** 0-100 */
    score: number;
    band: "low" | "moderate" | "high" | "very_high";
    factors: {
        name: string;
        contribution: number;
        detail: string;
    }[];
}
export declare function computeConfidence(input: ConfidenceInput): ConfidenceResult;
//# sourceMappingURL=confidence.d.ts.map