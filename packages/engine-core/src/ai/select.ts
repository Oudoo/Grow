/**
 * Which provider and model an AI call uses. Pure, so it can be unit-tested
 * without keys, and so the Developer console, the provider layer and the
 * scheduler all agree on one rule:
 *
 *  1. The console's model override wins when its family has a key
 *     (claude-* → Anthropic, gemini-* → Gemini, gpt-* → OpenAI).
 *  2. Otherwise AI_PRIMARY_PROVIDER, when it has a key.
 *  3. Otherwise the first provider that has a key, in PROVIDER_ORDER.
 *  4. Nothing configured → null; callers turn that into a clear error.
 *
 * A forced provider (the console's "Test Gemini" button) skips 1–3 and
 * fails rather than silently answering from a different provider.
 */
export type AiProvider = "anthropic" | "gemini" | "openai";

export const PROVIDER_ORDER: AiProvider[] = ["anthropic", "gemini", "openai"];

export function modelFamily(model: string | null | undefined): AiProvider | null {
  const m = (model ?? "").trim().toLowerCase();
  if (!m) return null;
  if (m.startsWith("claude-")) return "anthropic";
  if (m.startsWith("gemini-")) return "gemini";
  if (/^(gpt-|o\d)/.test(m)) return "openai";
  return null;
}

export interface AiChoiceInput {
  /** The console's ai.model flag, "" when unset. */
  flagModel: string;
  /** AI_PRIMARY_PROVIDER from the environment. */
  primary: string;
  keys: Record<AiProvider, boolean>;
  /** Per-provider default model from the environment. */
  models: Record<AiProvider, string>;
  forced?: AiProvider;
}

export interface AiChoice {
  provider: AiProvider;
  model: string;
}

export function chooseAi(input: AiChoiceInput): AiChoice | null {
  const { flagModel, primary, keys, models, forced } = input;
  if (forced) return keys[forced] ? { provider: forced, model: models[forced] } : null;

  const family = modelFamily(flagModel);
  if (family && keys[family]) return { provider: family, model: flagModel.trim() };

  const p = primary.trim().toLowerCase() as AiProvider;
  if ((PROVIDER_ORDER as string[]).includes(p) && keys[p]) return { provider: p, model: models[p] };

  const first = PROVIDER_ORDER.find((k) => keys[k]);
  return first ? { provider: first, model: models[first] } : null;
}

/** The providers to try, in order, after `first` — everything else with a key. */
export function fallbackOrder(first: AiProvider, keys: Record<AiProvider, boolean>): AiProvider[] {
  return PROVIDER_ORDER.filter((p) => p !== first && keys[p]);
}
