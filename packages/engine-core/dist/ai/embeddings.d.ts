import { type AiCallContext, type AiProvider } from "./provider.js";
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
export declare function activeEmbeddingModel(): {
    provider: AiProvider;
    model: string;
};
export declare function embedTexts(texts: string[], ctx: AiCallContext): Promise<number[][]>;
/** Chunk long text into ~1200-char overlapping windows for embedding. */
export declare function chunkText(text: string, chunkSize?: number, overlap?: number): string[];
//# sourceMappingURL=embeddings.d.ts.map