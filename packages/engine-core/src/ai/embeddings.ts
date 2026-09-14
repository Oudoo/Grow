import { env } from "../env.js";
import { gemini, openai, recordAiCost, type AiCallContext, type AiProvider } from "./provider.js";

/**
 * Embedding generation for the AOM semantic search layer (1536 dimensions).
 * Vectors are stored as JSON arrays in MySQL and ranked by cosine similarity
 * in application code (see semanticSearch in aom.ts) — no pgvector dependency.
 *
 * Provider: Gemini when it is the primary provider or the only one with a key,
 * else OpenAI. Gemini's models default to 3072 dimensions and are truncated
 * to 1536 so the column keeps one shape. Embedding spaces are NOT
 * interchangeable — a corpus embedded with one model must be searched with
 * the same model, which is why every row records `embeddingModel` and why
 * switching provider means re-indexing (production had no vectors before
 * 2026-09-14, so nothing needed re-indexing then).
 */
export function activeEmbeddingModel(): { provider: AiProvider; model: string } {
  if (env.geminiApiKey && (env.aiPrimaryProvider === "gemini" || !env.openaiApiKey)) {
    return { provider: "gemini", model: env.geminiEmbeddingModel };
  }
  return { provider: "openai", model: env.embeddingModel };
}

export async function embedTexts(
  texts: string[],
  ctx: AiCallContext
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const active = activeEmbeddingModel();
  if (active.provider === "gemini") {
    const res = await gemini().models.embedContent({
      model: active.model,
      contents: texts,
      config: { outputDimensionality: 1536 },
    });
    const vectors = (res.embeddings ?? []).map((e) => e.values ?? []);
    if (vectors.length !== texts.length) {
      throw new Error(`Gemini returned ${vectors.length} embeddings for ${texts.length} inputs`);
    }
    // The SDK reports no token count for embeddings; ~4 characters per token.
    const approxTokens = Math.ceil(texts.reduce((n, t) => n + t.length, 0) / 4);
    await recordAiCost({ ...ctx, feature: ctx.feature || "embedding" }, "gemini", active.model, approxTokens, 0);
    return vectors;
  }
  const model = active.model;
  const res = await openai().embeddings.create({
    model,
    input: texts,
    dimensions: 1536,
  });
  await recordAiCost(
    { ...ctx, feature: ctx.feature || "embedding" },
    "openai",
    model,
    res.usage?.prompt_tokens ?? 0,
    0
  );
  return res.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/** Chunk long text into ~1200-char overlapping windows for embedding. */
export function chunkText(text: string, chunkSize = 1200, overlap = 150): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= chunkSize) return clean ? [clean] : [];
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    // Break on sentence boundary when possible
    if (end < clean.length) {
      const lastPeriod = clean.lastIndexOf(". ", end);
      if (lastPeriod > start + chunkSize / 2) end = lastPeriod + 1;
    }
    chunks.push(clean.slice(start, end).trim());
    if (end >= clean.length) break;
    start = end - overlap;
  }
  return chunks;
}
