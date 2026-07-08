import { and, desc, eq, sql as dsql } from "drizzle-orm";
import { db, aomEmbeddings, aomLinks, recommendations, decisions, } from "@growengine/db";
import { chunkText, embedTexts } from "./ai/embeddings.js";
import { env } from "./env.js";
export async function indexEntity(input, ctx) {
    const chunks = chunkText(input.text);
    if (chunks.length === 0)
        return 0;
    // Re-index: drop stale chunks for this entity first
    await db
        .delete(aomEmbeddings)
        .where(and(eq(aomEmbeddings.tenantId, input.tenantId), eq(aomEmbeddings.entityType, input.entityType), eq(aomEmbeddings.entityId, input.entityId)));
    const vectors = await embedTexts(chunks, { ...ctx, feature: "aom_indexing" });
    await db.insert(aomEmbeddings).values(chunks.map((chunk, i) => ({
        tenantId: input.tenantId,
        clientId: input.clientId ?? null,
        entityType: input.entityType,
        entityId: input.entityId,
        chunkIndex: i,
        chunkText: chunk,
        embedding: vectors[i],
        embeddingModel: env.embeddingModel,
    })));
    return chunks.length;
}
/**
 * Semantic search across the AOM, strictly scoped to one tenant.
 */
export async function semanticSearch(tenantId, query, ctx, opts = {}) {
    const [queryVector] = await embedTexts([query], { ...ctx, feature: "aom_search" });
    if (!queryVector?.length)
        return [];
    const conditions = [eq(aomEmbeddings.tenantId, tenantId)];
    if (opts.clientId)
        conditions.push(eq(aomEmbeddings.clientId, opts.clientId));
    // MySQL has no native vector operators (no pgvector). Embeddings are stored
    // as JSON arrays; we fetch the tenant-scoped candidate chunks and rank them
    // by cosine similarity in application code. Bounded to keep memory flat —
    // for larger corpora, swap in a dedicated vector store behind this function.
    const CANDIDATE_CAP = 2000;
    const rows = await db
        .select({
        entityType: aomEmbeddings.entityType,
        entityId: aomEmbeddings.entityId,
        clientId: aomEmbeddings.clientId,
        chunkText: aomEmbeddings.chunkText,
        embedding: aomEmbeddings.embedding,
    })
        .from(aomEmbeddings)
        .where(and(...conditions))
        .limit(CANDIDATE_CAP);
    const wanted = opts.entityTypes?.length ? new Set(opts.entityTypes) : null;
    const qNorm = Math.sqrt(queryVector.reduce((s, v) => s + v * v, 0)) || 1;
    const scored = [];
    for (const r of rows) {
        if (wanted && !wanted.has(r.entityType))
            continue;
        const vec = r.embedding;
        if (!Array.isArray(vec) || vec.length !== queryVector.length)
            continue;
        let dot = 0;
        let norm = 0;
        for (let i = 0; i < vec.length; i++) {
            dot += vec[i] * queryVector[i];
            norm += vec[i] * vec[i];
        }
        const similarity = dot / (qNorm * (Math.sqrt(norm) || 1));
        scored.push({
            entityType: r.entityType,
            entityId: r.entityId,
            clientId: r.clientId,
            chunkText: r.chunkText,
            similarity,
        });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, opts.limit ?? 12);
}
export async function linkEntities(input) {
    await db.insert(aomLinks).values({
        tenantId: input.tenantId,
        fromEntityType: input.fromEntityType,
        fromEntityId: input.fromEntityId,
        toEntityType: input.toEntityType,
        toEntityId: input.toEntityId,
        linkType: input.linkType ?? "references",
    });
}
/**
 * Historical context query: recommendations for a client over a window,
 * with decision outcomes and measured impact — the canonical AOM query.
 */
export async function recommendationHistory(tenantId, clientId, sinceMonths = 18) {
    const since = new Date();
    since.setMonth(since.getMonth() - sinceMonths);
    const recs = await db
        .select()
        .from(recommendations)
        .where(and(eq(recommendations.tenantId, tenantId), eq(recommendations.clientId, clientId), dsql `${recommendations.createdAt} >= ${since.toISOString()}`))
        .orderBy(desc(recommendations.createdAt));
    const recDecisions = await db
        .select()
        .from(decisions)
        .where(and(eq(decisions.tenantId, tenantId), eq(decisions.clientId, clientId), eq(decisions.sourceEntityType, "recommendation")));
    const decisionByRec = new Map(recDecisions.map((d) => [d.sourceEntityId, d]));
    return recs.map((rec) => ({
        ...rec,
        decision: decisionByRec.get(rec.id) ?? null,
    }));
}
//# sourceMappingURL=aom.js.map