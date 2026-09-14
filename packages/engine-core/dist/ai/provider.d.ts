import { GoogleGenAI } from "@google/genai";
import { z } from "zod/v4";
import OpenAI from "openai";
import { type AiChoice, type AiProvider } from "./select.js";
/**
 * AI provider abstraction: Anthropic (Claude), Google (Gemini) and OpenAI
 * behind one `aiComplete` / `aiCompleteStructured` surface. Which one answers
 * is decided by ai/select.ts (console override → AI_PRIMARY_PROVIDER → first
 * key present); the others are automatic failover. Every call records token
 * usage and USD cost into cost_tracking and usage_records so the Cost
 * Tracking Dashboard and the Developer console reflect reality.
 *
 * Gemini joined on 2026-09-14 because the owner's Google AI Pro plan carries a
 * Google Developer Program cloud credit that funds the Gemini API's PAID tier
 * — the paid tier matters: Google does not train on paid-tier content, and
 * client meeting transcripts pass through here.
 */
export type { AiProvider } from "./select.js";
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
    /** Honoured by Gemini and OpenAI; Claude's current models reject sampling parameters. */
    temperature?: number;
    /** Force JSON output; the prompt must describe the schema. */
    json?: boolean;
    /** Use exactly this provider, no failover — the console's probes. */
    provider?: AiProvider;
}
/**
 * Thrown when the Developer console has AI switched off. Callers that run
 * jobs treat it as "skip, do not retry" (see the AI worker), not as a failure.
 */
export declare class AiDisabledError extends Error {
    readonly code = "AI_DISABLED";
    constructor();
}
export declare function openai(): OpenAI;
export declare function gemini(): GoogleGenAI;
export declare function providerKeys(): Record<AiProvider, boolean>;
/** Whether any provider key exists at all — the scheduler asks before queuing AI work. */
export declare function isAiConfigured(): boolean;
/** The provider + model a call would use right now (console override, env, keys). */
export declare function resolveAi(forced?: AiProvider): Promise<AiChoice>;
/** @deprecated use resolveAi(); kept for callers that only ever wanted the Claude model. */
export declare function resolveClaudeModel(): Promise<string>;
export declare function recordAiCost(ctx: AiCallContext, provider: string, model: string, inputTokens: number, outputTokens: number): Promise<number>;
/**
 * Complete a prompt with the resolved provider, failing over to the other
 * configured providers if it errors — unless a provider was forced.
 */
export declare function aiComplete(prompt: string, ctx: AiCallContext, opts?: AiCompletionOptions): Promise<string>;
/** Complete and parse a JSON response, stripping markdown fences if present. */
export declare function aiCompleteJson<T>(prompt: string, ctx: AiCallContext, opts?: AiCompletionOptions): Promise<T>;
/**
 * Complete with a schema-validated result.
 *  - Anthropic: the SDK's structured outputs (`messages.parse` + zod helper).
 *  - Gemini: `responseJsonSchema` from the same zod schema, then a zod parse.
 *  - OpenAI: JSON mode, then a zod parse.
 * The zod parse at the end is what every path has in common: the caller gets
 * exactly the type it asked for or an error, never a loosely shaped object.
 */
export declare function aiCompleteStructured<T>(schema: z.ZodType<T>, prompt: string, ctx: AiCallContext, opts?: AiCompletionOptions): Promise<T>;
//# sourceMappingURL=provider.d.ts.map