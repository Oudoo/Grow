import type { AiCallContext } from "./ai/provider.js";
/**
 * Agency Operating Memory service — indexes entities into the pgvector
 * semantic layer, maintains the entity link graph, and answers historical
 * context queries ("every recommendation made to this client in 18 months,
 * which were approved, and their impact").
 */
export interface IndexEntityInput {
    tenantId: string;
    clientId?: string | null;
    entityType: string;
    entityId: string;
    /** Full text to index; will be chunked + embedded. */
    text: string;
}
export declare function indexEntity(input: IndexEntityInput, ctx: AiCallContext): Promise<number>;
export interface SemanticSearchResult {
    entityType: string;
    entityId: string;
    clientId: string | null;
    chunkText: string;
    similarity: number;
}
/**
 * Semantic search across the AOM, strictly scoped to one tenant.
 */
export declare function semanticSearch(tenantId: string, query: string, ctx: AiCallContext, opts?: {
    clientId?: string;
    entityTypes?: string[];
    limit?: number;
}): Promise<SemanticSearchResult[]>;
export declare function linkEntities(input: {
    tenantId: string;
    fromEntityType: string;
    fromEntityId: string;
    toEntityType: string;
    toEntityId: string;
    linkType?: string;
}): Promise<void>;
/**
 * Historical context query: recommendations for a client over a window,
 * with decision outcomes and measured impact — the canonical AOM query.
 */
export declare function recommendationHistory(tenantId: string, clientId: string, sinceMonths?: number): Promise<{
    decision: {
        id: string;
        tenantId: string;
        clientId: string | null;
        title: string;
        outcome: string;
        reason: string | null;
        approvedByName: string | null;
        approvedByUserId: string | null;
        sourceEntityType: string | null;
        sourceEntityId: string | null;
        context: unknown;
        decidedAt: Date;
        createdAt: Date;
    } | null;
    id: string;
    tenantId: string;
    clientId: string;
    title: string;
    body: string;
    category: string;
    status: string;
    evidence: unknown;
    evidenceCount: number;
    confidenceScore: string | null;
    dataSources: unknown;
    expectedImpact: unknown;
    measuredImpact: unknown;
    proposedBy: string | null;
    aiGenerated: number;
    presentedAt: Date | null;
    decidedAt: Date | null;
    implementedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
//# sourceMappingURL=aom.d.ts.map