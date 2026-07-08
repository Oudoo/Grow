import { type AiCallContext } from "./provider.js";
/**
 * Embedding generation for the AOM semantic search layer (1536 dimensions,
 * OpenAI text-embedding-3-small by default). Vectors are stored as JSON
 * arrays in MySQL and ranked by cosine similarity in application code
 * (see semanticSearch in aom.ts) — no pgvector dependency.
 */
export declare function embedTexts(texts: string[], ctx: AiCallContext): Promise<number[][]>;
/** Chunk long text into ~1200-char overlapping windows for embedding. */
export declare function chunkText(text: string, chunkSize?: number, overlap?: number): string[];
//# sourceMappingURL=embeddings.d.ts.map