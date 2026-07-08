/**
 * Forecasting engine — Holt-Winters triple exponential smoothing with
 * additive seasonality, holdout backtesting (MAPE), prediction intervals,
 * seasonality index extraction and lost-opportunity quantification.
 * Pure TypeScript: zero licensing cost, fully deterministic and traceable.
 */
export interface SeriesPoint {
    date: string;
    value: number;
}
export interface ForecastPoint {
    date: string;
    value: number;
    lower: number;
    upper: number;
}
export interface ForecastOutput {
    points: ForecastPoint[];
    method: string;
    backtestMape: number | null;
    variability: number;
    trainingWindow: {
        from: string;
        to: string;
        observations: number;
    };
}
export declare function coefficientOfVariation(values: number[]): number;
/**
 * Forecast `horizonDays` ahead. Uses weekly seasonality (7) for daily data,
 * falling back to simple Holt linear trend when history is short.
 */
export declare function forecastSeries(history: SeriesPoint[], horizonDays: number): ForecastOutput;
export interface MonthlySeasonality {
    month: number;
    index: number;
    label: string;
}
/**
 * Monthly seasonality indices (1.0 = baseline) for heatmaps and budget
 * scaling maps. Requires at least ~6 months of daily data.
 */
export declare function extractMonthlySeasonality(history: SeriesPoint[]): MonthlySeasonality[];
export interface LostOpportunityEstimate {
    missedLow: number;
    missedHigh: number;
    methodology: string;
    evidenceCount: number;
}
/**
 * Lost Opportunity Quantifier — compares actual performance during
 * high-season windows (seasonality index > threshold) against what the
 * seasonal index implies was achievable, returning a conservative range.
 */
export declare function quantifyLostOpportunity(history: SeriesPoint[], seasonality: MonthlySeasonality[], threshold?: number): LostOpportunityEstimate;
//# sourceMappingURL=forecasting.d.ts.map