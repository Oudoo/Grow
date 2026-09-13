import "server-only";
import { prisma } from "./db";
import { listDirectory } from "./directory";
import { appUrl, isMailConfigured, sendMail } from "./mail";
import { getDevFlags } from "@growengine/core";

/**
 * Notifications: in-app rows first, email second.
 *
 * Writing the row and sending the email are separated on purpose. The row is
 * written synchronously inside the user's action, so the bell is correct the
 * moment the page revalidates. The email is an *outbox* — a queued copy sent by
 * `dispatchPendingEmails`. That separation is what keeps a slow or misconfigured
 * SMTP server from adding seconds to (or failing) a comment post.
 *
 * @see lib/mail.ts for the transport and its configuration.
 */

export type NotificationKind =
  | "mention"
  | "assigned"
  | "comment"
  | "status"
  | "due_soon"
  | "overdue";

export interface NotifyPayload {
  kind: NotificationKind;
  title: string;
  body?: string;
  /** Path within the app, e.g. /admin/projects/<id>?task=<taskId> */
  url?: string;
  taskId?: string;
  actorName?: string;
}

/**
 * Queue a notification for each recipient.
 *
 * `actorId` is never notified about their own action — being emailed for your
 * own comment is noise, and it is the fastest way to get a team to mute a
 * notification system entirely.
 *
 * Never throws: notification failure must not roll back the action that caused
 * it. A dropped notification is an annoyance; a failed save is data loss.
 */
export async function notifyUsers(
  userIds: string[],
  payload: NotifyPayload,
  actorId?: string | null,
): Promise<number> {
  const recipients = [...new Set(userIds.filter((id) => id && id !== actorId))];
  if (recipients.length === 0) return 0;

  try {
    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        kind: payload.kind,
        title: payload.title,
        body: payload.body ?? null,
        url: payload.url ?? null,
        taskId: payload.taskId ?? null,
        actorName: payload.actorName ?? null,
      })),
    });
    return recipients.length;
  } catch (e) {
    console.error("[notify] could not queue notifications:", e);
    return 0;
  }
}

/** Unread count for the bell. Returns 0 on error so the shell always renders. */
export async function unreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({ where: { userId, readAt: null } });
  } catch {
    return 0;
  }
}

export interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  url: string | null;
  actorName: string | null;
  readAt: Date | null;
  createdAt: Date;
}

/** Most recent notifications for one person. */
export async function recentNotifications(userId: string, take = 25): Promise<NotificationRow[]> {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true, kind: true, title: true, body: true,
        url: true, actorName: true, readAt: true, createdAt: true,
      },
    });
  } catch (e) {
    console.error("[notify] listing notifications failed:", e);
    return [];
  }
}

// ── Email rendering ────────────────────────────────────────────────────────

/** Minimal HTML escaping — notification text is user-authored. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const BRAND = {
  bg: "#F8F9FA",       // Alabaster — page body
  card: "#FFFFFF",     // Stark White — card
  accent: "#4F46E5",   // Deep Electric Indigo
  heading: "#1A202C",  // Charcoal Slate
  body: "#4A5568",
  border: "#E2E8F0",
};

/**
 * Table-based layout with inline styles: Outlook and most webmail clients strip
 * <style> blocks and have no flex/grid support, so this is the only structure
 * that renders consistently.
 */
function renderEmail(n: { title: string; body: string | null; url: string | null; actorName: string | null }): string {
  const link = n.url ? `${appUrl()}${n.url.startsWith("/") ? "" : "/"}${n.url}` : null;
  return `<!doctype html>
<html><body style="margin:0;padding:24px 0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:94%;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
  <tr><td style="padding:22px 28px;border-bottom:1px solid ${BRAND.border};">
    <span style="font-size:13px;font-weight:700;letter-spacing:.14em;color:${BRAND.accent};">GROW</span>
  </td></tr>
  <tr><td style="padding:28px;">
    <h1 style="margin:0 0 12px;font-size:19px;line-height:1.4;color:${BRAND.heading};font-weight:700;">${esc(n.title)}</h1>
    ${n.body ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.body};white-space:pre-wrap;">${esc(n.body)}</p>` : ""}
    ${link ? `<a href="${esc(link)}" style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 22px;border-radius:9px;">Open in GROW</a>` : ""}
  </td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid ${BRAND.border};">
    <p style="margin:0;font-size:12px;line-height:1.5;color:${BRAND.body};">
      ${n.actorName ? `Triggered by ${esc(n.actorName)}. ` : ""}You are receiving this because you have a GROW account.
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function renderText(n: { title: string; body: string | null; url: string | null }): string {
  const link = n.url ? `${appUrl()}${n.url.startsWith("/") ? "" : "/"}${n.url}` : null;
  return [n.title, "", n.body ?? "", link ? `\nOpen in GROW: ${link}` : ""]
    .filter((l) => l !== null)
    .join("\n")
    .trim();
}

// ── Outbox dispatch ────────────────────────────────────────────────────────

/** Give up after this many failed sends so one bad address cannot be retried forever. */
const MAX_EMAIL_ATTEMPTS = 3;

export interface DispatchResult {
  /** True when the Developer console has outbound email switched off. */
  paused?: boolean;
  sent: number;
  failed: number;
  skipped: number;
  configured: boolean;
}

/**
 * Send queued notification emails.
 *
 * Called by the cron endpoint (/api/notifications/dispatch) and opportunistically
 * after an action. Batched and bounded — on shared hosting a long-running send
 * loop is far more likely to be killed mid-flight than to finish.
 */
export async function dispatchPendingEmails(limit = 25): Promise<DispatchResult> {
  const result: DispatchResult = { sent: 0, failed: 0, skipped: 0, configured: isMailConfigured() };
  // Nothing to do without SMTP — leave the rows queued so they go out
  // as soon as credentials are configured, rather than burning attempts.
  if (!result.configured) return result;
  // Same treatment when the Developer console has outbound email paused:
  // rows wait, attempts are not spent, nothing is lost.
  if (!(await getDevFlags())["mail.enabled"]) return { ...result, paused: true };

  let pending;
  try {
    pending = await prisma.notification.findMany({
      where: { emailedAt: null, emailAttempts: { lt: MAX_EMAIL_ATTEMPTS } },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  } catch (e) {
    console.error("[notify] reading the outbox failed:", e);
    return result;
  }
  if (pending.length === 0) return result;

  // One directory read for the whole batch instead of a lookup per row.
  const directory = await listDirectory();
  const emailById = new Map(directory.map((u) => [u.id, u.email]));

  for (const n of pending) {
    const to = emailById.get(n.userId);
    if (!to) {
      // Deactivated or deleted account: retire the row rather than retrying.
      result.skipped++;
      await prisma.notification
        .update({
          where: { id: n.id },
          data: { emailAttempts: MAX_EMAIL_ATTEMPTS, emailError: "No active account/email for recipient" },
        })
        .catch(() => {});
      continue;
    }

    const sendResult = await sendMail({
      to,
      subject: n.title,
      text: renderText(n),
      html: renderEmail(n),
    });

    try {
      if (sendResult.ok) {
        result.sent++;
        await prisma.notification.update({
          where: { id: n.id },
          data: { emailedAt: new Date(), emailError: null },
        });
      } else {
        result.failed++;
        await prisma.notification.update({
          where: { id: n.id },
          data: {
            emailAttempts: { increment: 1 },
            emailError: (sendResult.error ?? sendResult.skipped ?? "unknown").slice(0, 500),
          },
        });
      }
    } catch (e) {
      console.error("[notify] recording delivery state failed:", e);
    }
  }

  return result;
}

/**
 * Fire-and-forget dispatch from inside a server action.
 *
 * The promise is intentionally not awaited by callers — the action returns as
 * soon as the notification rows are written. Anything still queued when the
 * process moves on is picked up by the next cron sweep, so nothing is lost.
 */
export function dispatchInBackground(limit = 10): void {
  void dispatchPendingEmails(limit).catch((e) =>
    console.error("[notify] background dispatch failed:", e),
  );
}
