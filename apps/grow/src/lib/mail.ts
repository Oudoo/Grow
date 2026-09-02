import "server-only";
import type { Transporter } from "nodemailer";

/**
 * SMTP transport for outbound notification email.
 *
 * Two rules govern everything here:
 *
 *  1. **Email must never break the app.** Sending is always downstream of the
 *     thing the user actually did (posting a comment, assigning a task). A
 *     wrong password or an unreachable mail server must degrade to "no email",
 *     never to a failed save. Every entry point returns a result object and
 *     swallows its own errors.
 *  2. **Configuration is optional.** With no SMTP_* variables set the app runs
 *     normally and notifications still appear in-app; only the email copy is
 *     skipped. That keeps local development and a fresh deploy working before
 *     anyone has created a mailbox.
 *
 * Hostinger mailbox settings (Emails → your @growcdx.com account):
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465          # 465 = implicit TLS, 587 = STARTTLS
 *   SMTP_USER=internal@growcdx.com
 *   SMTP_PASS=<the mailbox password>
 *   MAIL_FROM="GROW <internal@growcdx.com>"
 *   APP_URL=https://growcdx.com          # used to build absolute deep links
 * Put these in .grow.env, which lives outside the deploy directory and is
 * loaded authoritatively by server.js.
 */

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface SendResult {
  ok: boolean;
  skipped?: "unconfigured" | "no-recipient";
  error?: string;
}

/**
 * Read SMTP settings from the environment, or null when incomplete.
 *
 * Deliberately re-read on every call rather than captured at module load:
 * server.js loads .grow.env *after* some modules are first required, and a
 * value snapshotted at import time would miss it.
 */
export function readMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);
  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    // Port 465 is implicit TLS; 587/25 start plaintext and upgrade via STARTTLS.
    secure: (process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false")) === "true",
    user,
    pass,
    from: process.env.MAIL_FROM?.trim() || `GROW <${user}>`,
  };
}

export function isMailConfigured(): boolean {
  return readMailConfig() !== null;
}

/**
 * Cached transporter. Reused so we hold one pooled connection rather than
 * reconnecting per message — a burst of mentions on one comment would
 * otherwise open a socket each.
 */
let cached: { transporter: Transporter; key: string } | null = null;

async function getTransporter(cfg: MailConfig): Promise<Transporter> {
  // Rebuild if the credentials changed under us (env reloaded on restart).
  const key = `${cfg.host}:${cfg.port}:${cfg.user}`;
  if (cached && cached.key === key) return cached.transporter;

  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    pool: true,
    maxConnections: 2,
    // Shared hosting can be slow to hand out sockets; bound every phase so a
    // hung connection cannot pin the dispatcher indefinitely.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  cached = { transporter, key };
  return transporter;
}

export interface Mail {
  to: string;
  subject: string;
  /** Plain-text body. Always sent — some clients and all screen readers need it. */
  text: string;
  /** Optional HTML body; when absent the text body is used alone. */
  html?: string;
}

/**
 * Send one message. Never throws: inspect the returned result.
 */
export async function sendMail(mail: Mail): Promise<SendResult> {
  if (!mail.to) return { ok: false, skipped: "no-recipient" };

  const cfg = readMailConfig();
  if (!cfg) return { ok: false, skipped: "unconfigured" };

  try {
    const transporter = await getTransporter(cfg);
    await transporter.sendMail({
      from: cfg.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error(`[mail] send to ${mail.to} failed: ${error}`);
    // Drop the cached transporter so the next attempt reconnects rather than
    // reusing a socket that may already be dead.
    cached = null;
    return { ok: false, error };
  }
}

/**
 * Prove the SMTP credentials work without sending anything.
 * Surfaced by the admin health check so a bad password is visible immediately
 * instead of showing up as silently missing email.
 */
export async function verifyMailConnection(): Promise<SendResult> {
  const cfg = readMailConfig();
  if (!cfg) return { ok: false, skipped: "unconfigured" };
  try {
    const transporter = await getTransporter(cfg);
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    cached = null;
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Absolute base URL for deep links in emails. */
export function appUrl(): string {
  return (process.env.APP_URL || "https://growcdx.com").replace(/\/+$/, "");
}
