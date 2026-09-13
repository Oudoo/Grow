import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod/v4";
import OpenAI from "openai";
import { db, costTracking, usageRecords } from "@growengine/db";
import { env } from "../env.js";
import { getDevFlags } from "../dev-flags.js";

/**
 * Thrown when the Developer console has AI switched off. Callers that run
 * jobs treat it as "skip, do not retry" (see the AI worker), not as a failure.
 */
export class AiDisabledError extends Error {
  readonly code = "AI_DISABLED";
  constructor() {
    super("AI features are switched off in the Developer console (ai.enabled = false)");
  }
}

/** Whether any provider key exists at all — the scheduler asks before queuing AI work. */
export function isAiConfigured(): boolean {
  return Boolean(env.anthropicApiKey || env.openaiApiKey);
}

/** The Claude model to use right now: the console's override, else the env default. */
export async function resolveClaudeModel(): Promise<string> {
  const flags = await getDevFlags();
  return flags["ai.model"] || env.anthropicModel;
}

async function assertAiEnabled(): Promise<void> {
  const flags = await getDevFlags();
  if (!flags["ai.enabled"]) throw new AiDisabledError();
}

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

/** USD per 1M tokens — keep current with provider pricing pages. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-fable-5-1": { input: 10, output: 50 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-opus-4-8": { input: 15, output: 75 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "text-embedding-3-small": { input: 0.02, output: 0 },
  "text-embedding-3-large": { input: 0.13, output: 0 },
};

function costUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model] ?? { input: 3, output: 15 };
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function anthropic(): Anthropic {
  if (!env.anthropicApiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  anthropicClient ??= new Anthropic({ apiKey: env.anthropicApiKey });
  return anthropicClient;
}

export function openai(): OpenAI {
  if (!env.openaiApiKey) throw new Error("OPENAI_API_KEY is not configured");
  openaiClient ??= new OpenAI({ apiKey: env.openaiApiKey });
  return openaiClient;
}

export async function recordAiCost(
  ctx: AiCallContext,
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
) {
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

/**
 * Anthropic path. Two things changed on 2026-09-12 for the current models:
 *  - `temperature` is no longer sent. Claude Opus 5 / Sonnet 5 / Opus 4.7+
 *    reject sampling parameters with a 400; `opts.temperature` is still
 *    honoured by the OpenAI path.
 *  - `stop_reason: "refusal"` is handled before the content is read. A
 *    refused request has no text and must not be recorded as an empty
 *    answer; the caller gets an error naming the reason instead.
 */
async function completeWithAnthropic(
  prompt: string,
  opts: AiCompletionOptions,
  ctx: AiCallContext
): Promise<string> {
  const model = await resolveClaudeModel();
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

const JSON_ONLY =
  "Respond with a single JSON value and nothing else: no prose before or after it, no markdown fences.";

/**
 * Complete with a schema-validated result. Uses the Anthropic SDK's structured
 * outputs (`messages.parse` + `output_config.format`) so the JSON is
 * guaranteed to match the schema, and falls back to the text-and-parse path
 * (then a schema parse) only when Anthropic is not configured.
 */
export async function aiCompleteStructured<T>(
  schema: z.ZodType<T>,
  prompt: string,
  ctx: AiCallContext,
  opts: AiCompletionOptions = {}
): Promise<T> {
  await assertAiEnabled();
  if (!env.anthropicApiKey) {
    const loose = await aiCompleteJson<unknown>(prompt, ctx, opts);
    return schema.parse(loose);
  }
  const model = await resolveClaudeModel();
  const res = await anthropic().messages.parse({
    model,
    max_tokens: opts.maxTokens ?? 16000,
    system: opts.system,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: zodOutputFormat(schema) },
  });
  await recordAiCost(ctx, "anthropic", model, res.usage.input_tokens, res.usage.output_tokens);
  if (res.stop_reason === "refusal") {
    throw new Error(`Claude declined this request (${res.stop_details?.category ?? "refusal"})`);
  }
  if (res.parsed_output == null) {
    throw new Error(`Structured output did not parse (stop_reason: ${res.stop_reason})`);
  }
  return res.parsed_output;
}

async function completeWithOpenAi(
  prompt: string,
  opts: AiCompletionOptions,
  ctx: AiCallContext
): Promise<string> {
  const model = env.openaiModel;
  const res = await openai().chat.completions.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.2,
    response_format: opts.json ? { type: "json_object" } : undefined,
    messages: [
      ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
      { role: "user" as const, content: prompt },
    ],
  });
  await recordAiCost(
    ctx,
    "openai",
    model,
    res.usage?.prompt_tokens ?? 0,
    res.usage?.completion_tokens ?? 0
  );
  return res.choices[0]?.message?.content ?? "";
}

/**
 * Complete a prompt with the primary provider, falling back to the
 * secondary if the primary is unconfigured or errors.
 */
export async function aiComplete(
  prompt: string,
  ctx: AiCallContext,
  opts: AiCompletionOptions = {}
): Promise<string> {
  await assertAiEnabled();
  const order =
    env.aiPrimaryProvider === "openai"
      ? (["openai", "anthropic"] as const)
      : (["anthropic", "openai"] as const);

  let lastError: Error | null = null;
  for (const provider of order) {
    const hasKey = provider === "anthropic" ? !!env.anthropicApiKey : !!env.openaiApiKey;
    if (!hasKey) continue;
    try {
      return provider === "anthropic"
        ? await completeWithAnthropic(prompt, opts, ctx)
        : await completeWithOpenAi(prompt, opts, ctx);
    } catch (err) {
      lastError = err as Error;
    }
  }
  throw lastError ?? new Error("No AI provider configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)");
}

/** Complete and parse a JSON response, stripping markdown fences if present. */
export async function aiCompleteJson<T>(
  prompt: string,
  ctx: AiCallContext,
  opts: AiCompletionOptions = {}
): Promise<T> {
  const raw = await aiComplete(prompt, ctx, { ...opts, json: true });
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  const start = cleaned.indexOf(cleaned.startsWith("[") ? "[" : "{");
  const jsonText = start >= 0 ? cleaned.slice(start) : cleaned;
  return JSON.parse(jsonText) as T;
}
