import OpenAI from "openai";
/**
 * AI provider abstraction. Primary provider is env-configured
 * (AI_PRIMARY_PROVIDER); the other acts as automatic failover. Every call
 * records token usage + USD cost into cost_tracking and usage_records so
 * the Cost Tracking Dashboard reflects reality per tenant/client/feature.
 */
export interface AiCallContext {
    tenantId: string;
    clientId?: string | null;
    projectId?: string | null;
    feature: string;
    aiJobId?: string | null;
}
export interface AiCompletionOptions {
    system?: string;
    maxTokens?: number;
    temperature?: number;
    /** Force JSON output; the prompt must describe the schema. */
    json?: boolean;
}
export declare function openai(): OpenAI;
export declare function recordAiCost(ctx: AiCallContext, provider: string, model: string, inputTokens: number, outputTokens: number): Promise<number>;
/**
 * Complete a prompt with the primary provider, falling back to the
 * secondary if the primary is unconfigured or errors.
 */
export declare function aiComplete(prompt: string, ctx: AiCallContext, opts?: AiCompletionOptions): Promise<string>;
/** Complete and parse a JSON response, stripping markdown fences if present. */
export declare function aiCompleteJson<T>(prompt: string, ctx: AiCallContext, opts?: AiCompletionOptions): Promise<T>;
//# sourceMappingURL=provider.d.ts.map