/**
 * Enterprise Audit Trail helper — call from every mutating server action
 * and route handler.
 */
export interface AuditInput {
    tenantId: string;
    actorId?: string | null;
    actorType?: "user" | "system" | "api_key" | "worker";
    action: string;
    entityType?: string;
    entityId?: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}
export declare function audit(input: AuditInput): Promise<void>;
//# sourceMappingURL=audit.d.ts.map