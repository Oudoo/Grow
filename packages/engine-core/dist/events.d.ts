/**
 * Domain Event Layer — producers publish, the events worker fans out to
 * registered handlers (forecast refresh, health score refresh, digests,
 * AOM indexing, notification rules, outbound webhooks). This prevents
 * tight coupling between modules.
 */
export declare const EVENT_TYPES: {
    readonly tenantCreated: "tenant.created";
    readonly clientCreated: "client.created";
    readonly clientOnboarded: "client.onboarded";
    readonly integrationConnected: "integration.connected";
    readonly integrationSyncCompleted: "integration.sync_completed";
    readonly integrationFailed: "integration.failed";
    readonly integrationTokenExpiring: "integration.token_expiring";
    readonly meetingRecorded: "meeting.recorded";
    readonly meetingAnalyzed: "meeting.analyzed";
    readonly transcriptReady: "transcript.ready";
    readonly recommendationCreated: "recommendation.created";
    readonly recommendationVerified: "recommendation.verified";
    readonly recommendationApproved: "recommendation.approved";
    readonly decisionRecorded: "decision.recorded";
    readonly dmaicGenerated: "dmaic.generated";
    readonly dmaicPhaseAdvanced: "dmaic.phase_advanced";
    readonly forecastGenerated: "forecast.generated";
    readonly healthScoreComputed: "health_score.computed";
    readonly catRequested: "cat.requested";
    readonly catDecided: "cat.decided";
    readonly pilotCompleted: "pilot.completed";
    readonly aeoAuditCompleted: "aeo_audit.completed";
    readonly leadAuditSubmitted: "lead_audit.submitted";
    readonly leadAuditCompleted: "lead_audit.completed";
    readonly milestoneReached: "milestone.reached";
    readonly ticketCreated: "ticket.created";
    readonly ticketSlaBreached: "ticket.sla_breached";
    readonly taskCompleted: "task.completed";
    readonly sowGenerated: "sow.generated";
    readonly invoiceIssued: "invoice.issued";
    readonly usageLimitApproaching: "usage.limit_approaching";
    readonly showcasePublished: "showcase.published";
};
export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
export interface PublishEventInput {
    tenantId: string | null;
    eventType: EventType | string;
    payload?: Record<string, unknown>;
    entityType?: string;
    entityId?: string;
}
/**
 * Persist the event, then enqueue fan-out. Persistence first guarantees an
 * auditable record even if Redis is briefly unavailable.
 */
export declare function publishEvent(input: PublishEventInput): Promise<{
    id: string;
    tenantId: string | null;
    eventType: string;
    payload: unknown;
    entityType: string | null;
    entityId: string | null;
    dispatchStatus: string;
    handlerResults: unknown;
    occurredAt: Date;
    dispatchedAt: Date | null;
}>;
//# sourceMappingURL=events.d.ts.map