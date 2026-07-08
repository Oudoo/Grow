/** Minimal {{placeholder}} template renderer (dot-path aware). */
export declare function renderTemplate(template: string, data: Record<string, unknown>): string;
export interface NotifyInput {
    tenantId: string;
    userId?: string | null;
    channel: "in_app" | "email" | "slack" | "teams" | "webhook";
    templateKey?: string;
    title: string;
    body?: string;
    linkUrl?: string;
    metadata?: Record<string, unknown>;
}
/** Create the notification record and enqueue dispatch. */
export declare function notify(input: NotifyInput): Promise<{
    id: string;
    tenantId: string;
    userId: string | null;
    channel: string;
    templateKey: string | null;
    title: string;
    body: string | null;
    linkUrl: string | null;
    status: string;
    error: string | null;
    metadata: unknown;
    readAt: Date | null;
    sentAt: Date | null;
    createdAt: Date;
}>;
/** Physical delivery — called only from the Notification Worker. */
export declare function deliverNotification(notificationId: string): Promise<void>;
/**
 * Evaluate notification rules for a domain event — resolves audience and
 * fans out notifications through the configured channels.
 */
export declare function applyNotificationRules(tenantId: string, eventType: string, payload: Record<string, unknown>): Promise<void>;
//# sourceMappingURL=notifications.d.ts.map