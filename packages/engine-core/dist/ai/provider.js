import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod/v4";
import OpenAI from "openai";
import { db, costTracking, usageRecords } from "@growengine/db";
import { env } from "../env.js";
import { getDevFlags } from "../dev-flags.js";
import { chooseAi, fallbackOrder } from "./select.js";
/**
 * Thrown when the Developer console has AI switched off. Callers that run
 * jobs treat it as "skip, do not retry" (see the AI worker), not as a failure.
 */
export class AiDisabledError extends Error {
    code = "AI_DISABLED";
    constructor() {
        super("AI features are switched off in the Developer console (ai.enabled = false)");
    }
}
/** USD per 1M tokens — keep current with the provider pricing pages. */
const PRICING = {
    // Anthropic
    "claude-opus-5": { input: 5, output: 25 },
    "claude-sonnet-5": { input: 2, output: 10 },
    "claude-fable-5-1": { input: 10, output: 50 },
    "claude-haiku-4-5": { input: 1, output: 5 },
    "claude-sonnet-4-6": { input: 3, output: 15 },
    "claude-opus-4-8": { input: 15, output: 75 },
    "claude-haiku-4-5-20251001": { input: 1, output: 5 },
    // Google (paid tier, prompts ≤ 200k where tiered)
    "gemini-3.1-pro-preview": { input: 2, output: 12 },
    "gemini-3.8-flash": { input: 0.75, output: 3.75 },
    "gemini-3.7-flash": { input: 0.75, output: 3.75 },
    "gemini-3.5-flash": { input: 1.5, output: 9 },
    "gemini-3.5-flash-lite": { input: 0.3, output: 2.5 },
    "gemini-2.5-pro": { input: 1.25, output: 10 },
    "gemini-2.5-flash": { input: 0.3, output: 2.5 },
    "gemini-2.5-flash-lite": { input: 0.1, output: 0.4 },
    "gemini-embedding-2": { input: 0.2, output: 0 },
    // Not on the pricing page any more; assumed equal to embedding-2.
    "gemini-embedding-001": { input: 0.2, output: 0 },
    // OpenAI
    "gpt-4o": { input: 2.5, output: 10 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "text-embedding-3-small": { input: 0.02, output: 0 },
    "text-embedding-3-large": { input: 0.13, output: 0 },
};
function costUsd(model, inputTokens, outputTokens) {
    const p = PRICING[model] ?? { input: 3, output: 15 };
    return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}
let anthropicClient = null;
let openaiClient = null;
let geminiClient = null;
function anthropic() {
    if (!env.anthropicApiKey)
        throw new Error("ANTHROPIC_API_KEY is not configured");
    anthropicClient ??= new Anthropic({ apiKey: env.anthropicApiKey });
    return anthropicClient;
}
export function openai() {
    if (!env.openaiApiKey)
        throw new Error("OPENAI_API_KEY is not configured");
    openaiClient ??= new OpenAI({ apiKey: env.openaiApiKey });
    return openaiClient;
}
export function gemini() {
    if (!env.geminiApiKey)
        throw new Error("GEMINI_API_KEY is not configured");
    geminiClient ??= new GoogleGenAI({ apiKey: env.geminiApiKey });
    return geminiClient;
}
export function providerKeys() {
    return {
        anthropic: Boolean(env.anthropicApiKey),
        gemini: Boolean(env.geminiApiKey),
        openai: Boolean(env.openaiApiKey),
    };
}
/** Whether any provider key exists at all — the scheduler asks before queuing AI work. */
export function isAiConfigured() {
    const k = providerKeys();
    return k.anthropic || k.gemini || k.openai;
}
function envModels() {
    return { anthropic: env.anthropicModel, gemini: env.geminiModel, openai: env.openaiModel };
}
/** The provider + model a call would use right now (console override, env, keys). */
export async function resolveAi(forced) {
    const flags = await getDevFlags();
    const choice = chooseAi({
        flagModel: flags["ai.model"],
        primary: env.aiPrimaryProvider,
        keys: providerKeys(),
        models: envModels(),
        forced,
    });
    if (!choice) {
        throw new Error(forced
            ? `${forced} is not configured (no API key in .grow.env)`
            : "No AI provider configured (set GEMINI_API_KEY, ANTHROPIC_API_KEY or OPENAI_API_KEY)");
    }
    return choice;
}
/** @deprecated use resolveAi(); kept for callers that only ever wanted the Claude model. */
export async function resolveClaudeModel() {
    const flags = await getDevFlags();
    return flags["ai.model"].startsWith("claude-") ? flags["ai.model"] : env.anthropicModel;
}
async function assertAiEnabled() {
    const flags = await getDevFlags();
    if (!flags["ai.enabled"])
        throw new AiDisabledError();
}
export async function recordAiCost(ctx, provider, model, inputTokens, outputTokens) {
    const cost = costUsd(model, inputTokens, outputTokens);
    await db.insert(costTracking).values({
        tenantId: ctx.tenantId,
        clientId: ctx.clientId ?? null,
        projectId: ctx.projectId ?? null,
        provider,
        model,
        feature: ctx.feature,
        inputTokens,
        outputTokens,
        costUsd: cost.toFixed(6),
        aiJobId: ctx.aiJobId ?? null,
    });
    await db.insert(usageRecords).values({
        tenantId: ctx.tenantId,
        meter: "ai_tokens",
        quantity: String(inputTokens + outputTokens),
        usageDate: new Date().toISOString().slice(0, 10),
        metadata: { provider, model, feature: ctx.feature },
    });
    return cost;
}
const JSON_ONLY = "Respond with a single JSON value and nothing else: no prose before or after it, no markdown fences.";
// ── Anthropic ─────────────────────────────────────────────────────────────
// `temperature` is not sent: Claude Opus 5 / Sonnet 5 / Opus 4.7+ reject
// sampling parameters with a 400. A refusal stop reason raises rather than
// being recorded as an empty answer.
async function completeWithAnthropic(model, prompt, opts, ctx) {
    const res = await anthropic().messages.create({
        model,
        max_tokens: opts.maxTokens ?? 16000,
        system: opts.json ? [opts.system, JSON_ONLY].filter(Boolean).join("\n\n") : opts.system,
        messages: [{ role: "user", content: prompt }],
    });
    await recordAiCost(ctx, "anthropic", model, res.usage.input_tokens, res.usage.output_tokens);
    if (res.stop_reason === "refusal") {
        throw new Error(`Claude declined this request (${res.stop_details?.category ?? "refusal"})`);
    }
    const block = res.content.find((c) => c.type === "text");
    return block && block.type === "text" ? block.text : "";
}
// ── Gemini ────────────────────────────────────────────────────────────────
// Thinking tokens are billed as output on the 2.5/3.x models, so they are
// counted with the answer. `response.text` is undefined when the model
// returned no text (safety block, or MAX_TOKENS spent on thinking) — that is
// an error with the finish reason, never an empty string.
function geminiUsage(res) {
    const u = res.usageMetadata;
    return { input: u?.promptTokenCount ?? 0, output: (u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0) };
}
async function completeWithGemini(model, prompt, opts, ctx, responseJsonSchema) {
    const res = await gemini().models.generateContent({
        model,
        contents: prompt,
        config: {
            ...(opts.system ? { systemInstruction: opts.system } : {}),
            maxOutputTokens: opts.maxTokens ?? 16000,
            temperature: opts.temperature ?? 0.2,
            ...(opts.json || responseJsonSchema ? { responseMimeType: "application/json" } : {}),
            ...(responseJsonSchema ? { responseJsonSchema } : {}),
        },
    });
    const usage = geminiUsage(res);
    await recordAiCost(ctx, "gemini", model, usage.input, usage.output);
    const text = res.text;
    if (!text) {
        const reason = res.candidates?.[0]?.finishReason ?? res.promptFeedback?.blockReason ?? "unknown";
        throw new Error(`Gemini returned no text (${reason})`);
    }
    return text;
}
// ── OpenAI ────────────────────────────────────────────────────────────────
async function completeWithOpenAi(model, prompt, opts, ctx) {
    const res = await openai().chat.completions.create({
        model,
        max_tokens: opts.maxTokens ?? 4096,
        temperature: opts.temperature ?? 0.2,
        response_format: opts.json ? { type: "json_object" } : undefined,
        messages: [
            ...(opts.system ? [{ role: "system", content: opts.system }] : []),
            { role: "user", content: prompt },
        ],
    });
    await recordAiCost(ctx, "openai", model, res.usage?.prompt_tokens ?? 0, res.usage?.completion_tokens ?? 0);
    return res.choices[0]?.message?.content ?? "";
}
async function runProvider(choice, prompt, opts, ctx) {
    switch (choice.provider) {
        case "anthropic":
            return completeWithAnthropic(choice.model, prompt, opts, ctx);
        case "gemini":
            return completeWithGemini(choice.model, prompt, opts, ctx);
        case "openai":
            return completeWithOpenAi(choice.model, prompt, opts, ctx);
    }
}
/**
 * Complete a prompt with the resolved provider, failing over to the other
 * configured providers if it errors — unless a provider was forced.
 */
export async function aiComplete(prompt, ctx, opts = {}) {
    await assertAiEnabled();
    const first = await resolveAi(opts.provider);
    const keys = providerKeys();
    const models = envModels();
    const attempts = [first];
    if (!opts.provider) {
        for (const provider of fallbackOrder(first.provider, keys))
            attempts.push({ provider, model: models[provider] });
    }
    let lastError = null;
    for (const choice of attempts) {
        try {
            return await runProvider(choice, prompt, opts, ctx);
        }
        catch (err) {
            lastError = err;
            if (opts.provider)
                throw err;
        }
    }
    throw lastError ?? new Error("No AI provider configured");
}
/** Complete and parse a JSON response, stripping markdown fences if present. */
export async function aiCompleteJson(prompt, ctx, opts = {}) {
    const raw = await aiComplete(prompt, ctx, { ...opts, json: true });
    const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
    const start = cleaned.indexOf(cleaned.startsWith("[") ? "[" : "{");
    const jsonText = start >= 0 ? cleaned.slice(start) : cleaned;
    return JSON.parse(jsonText);
}
/**
 * Complete with a schema-validated result.
 *  - Anthropic: the SDK's structured outputs (`messages.parse` + zod helper).
 *  - Gemini: `responseJsonSchema` from the same zod schema, then a zod parse.
 *  - OpenAI: JSON mode, then a zod parse.
 * The zod parse at the end is what every path has in common: the caller gets
 * exactly the type it asked for or an error, never a loosely shaped object.
 */
export async function aiCompleteStructured(schema, prompt, ctx, opts = {}) {
    await assertAiEnabled();
    const choice = await resolveAi(opts.provider);
    if (choice.provider === "anthropic") {
        const res = await anthropic().messages.parse({
            model: choice.model,
            max_tokens: opts.maxTokens ?? 16000,
            system: opts.system,
            messages: [{ role: "user", content: prompt }],
            output_config: { format: zodOutputFormat(schema) },
        });
        await recordAiCost(ctx, "anthropic", choice.model, res.usage.input_tokens, res.usage.output_tokens);
        if (res.stop_reason === "refusal") {
            throw new Error(`Claude declined this request (${res.stop_details?.category ?? "refusal"})`);
        }
        if (res.parsed_output == null) {
            throw new Error(`Structured output did not parse (stop_reason: ${res.stop_reason})`);
        }
        return res.parsed_output;
    }
    if (choice.provider === "gemini") {
        // Gemini accepts JSON Schema directly; `$schema` is the one key it has no use for.
        const jsonSchema = z.toJSONSchema(schema);
        delete jsonSchema.$schema;
        const text = await completeWithGemini(choice.model, prompt, opts, ctx, jsonSchema);
        return schema.parse(JSON.parse(text));
    }
    const loose = await aiCompleteJson(prompt, ctx, { ...opts, provider: "openai" });
    return schema.parse(loose);
}
//# sourceMappingURL=provider.js.map