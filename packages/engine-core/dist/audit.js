import { db, auditLogs } from "@growengine/db";
export async function audit(input) {
    await db.insert(auditLogs).values({
        tenantId: input.tenantId,
        actorId: input.actorId ?? null,
        actorType: input.actorType ?? "user",
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        changes: input.changes ?? {},
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
    });
}
//# sourceMappingURL=audit.js.map