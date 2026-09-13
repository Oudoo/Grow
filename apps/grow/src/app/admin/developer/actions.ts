"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { desc, eq, inArray, lt, and } from "drizzle-orm";
import { db, aiJobs, queueJobs } from "@growengine/db";
import {
  DEV_FLAG_DEFS,
  DEV_FLAGS_SETTING_KEY,
  aiComplete,
  enqueueAiJob,
  getDevFlags,
  invalidateDevFlags,
  isMayaConfigured,
  resolveClaudeModel,
  vexaStatus,
  type AiJobData,
} from "@growengine/core";
import { assertDeveloper } from "@/lib/auth";
import { requireTeamUser } from "@/lib/engine/session";
import { prisma } from "@/lib/db";
import { deleteAnySetting, writeAnySetting } from "@/lib/settings";
import { dispatchInBackground, dispatchPendingEmails, notifyUsers } from "@/lib/notify";
import { sweepDueDates } from "@/lib/reminders";
import { readMailConfig, sendMail, verifyMailConnection } from "@/lib/mail";
import type { DevResult } from "./DevForm";

const execFileAsync = promisify(execFile);

/**
 * Developer console actions. Every one starts with assertDeveloper(): the
 * route is gated in middleware and the page, but actions are dispatched by id
 * and must guard themselves (HANDOVER §9). Results are returned, never thrown,
 * so the console can show them (§11.5).
 */

const pretty = (v: unknown) => JSON.stringify(v, null, 2);

function failed(err: unknown): DevResult {
  return { ok: false, message: err instanceof Error ? err.message : String(err) };
}

// ── Flags ────────────────────────────────────────────────────────────────

export async function saveFlagsAction(formData: FormData): Promise<DevResult> {
  try {
    const actor = await assertDeveloper();
    const next: Record<string, boolean | string> = {};
    for (const [key, def] of Object.entries(DEV_FLAG_DEFS)) {
      const raw = formData.get(key);
      if (def.kind === "boolean") next[key] = raw === "on" || raw === "true";
      else if (def.kind === "select") {
        const value = typeof raw === "string" ? raw : "";
        next[key] = (def.options as readonly string[]).includes(value) ? value : def.default;
      } else next[key] = typeof raw === "string" ? raw.trim().slice(0, 500) : "";
    }
    await writeAnySetting(DEV_FLAGS_SETTING_KEY, JSON.stringify(next), actor.uid);
    invalidateDevFlags();
    revalidatePath("/admin/developer");
    revalidatePath("/admin", "layout");
    const flags = await getDevFlags();
    return { ok: true, message: "Flags saved — live everywhere within 15 seconds.", output: pretty(flags) };
  } catch (err) {
    return failed(err);
  }
}

// ── Probes ────────────────────────────────────────────────────────────────

export async function testClaudeAction(): Promise<DevResult> {
  try {
    await assertDeveloper();
    const user = await requireTeamUser();
    const model = await resolveClaudeModel();
    const started = Date.now();
    const text = await aiComplete(
      "Reply with the single word OK.",
      { tenantId: user.tenantId, feature: "developer_test" },
      { maxTokens: 20 }
    );
    return {
      ok: true,
      message: `Claude answered in ${Date.now() - started} ms.`,
      output: pretty({ model, reply: text.trim(), note: "Cost recorded in cost_tracking under feature developer_test." }),
    };
  } catch (err) {
    return failed(err);
  }
}

export async function testVexaAction(): Promise<DevResult> {
  try {
    await assertDeveloper();
    if (!isMayaConfigured()) return { ok: false, message: "VEXA_API_KEY is not set in .grow.env." };
    const started = Date.now();
    const status = await vexaStatus();
    return { ok: true, message: `Vexa answered in ${Date.now() - started} ms.`, output: pretty(status) };
  } catch (err) {
    return failed(err);
  }
}

export async function testMailAction(): Promise<DevResult> {
  try {
    const actor = await assertDeveloper();
    const cfg = readMailConfig();
    if (!cfg) return { ok: false, message: "SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS)." };
    const verified = await verifyMailConnection();
    if (!verified.ok) return { ok: false, message: "SMTP connection failed.", output: pretty(verified) };
    const sent = await sendMail({
      to: actor.email,
      subject: "GROW developer console — test email",
      text: `This is a test sent from /admin/developer by ${actor.name} at ${new Date().toISOString()}.`,
    });
    return {
      ok: sent.ok,
      message: sent.ok ? `Sent to ${actor.email}.` : "Send failed.",
      output: pretty({ transport: { host: cfg.host, port: cfg.port, user: cfg.user }, result: sent }),
    };
  } catch (err) {
    return failed(err);
  }
}

export async function testNotificationAction(): Promise<DevResult> {
  try {
    const actor = await assertDeveloper();
    const n = await notifyUsers([actor.uid], {
      kind: "status",
      title: "Developer console test notification",
      body: "If email is configured and enabled, this also arrives in your inbox on the next dispatch.",
      url: "/admin/developer",
      actorName: "Developer console",
    });
    dispatchInBackground();
    return { ok: true, message: `${n} notification queued for you; dispatch started in the background.` };
  } catch (err) {
    return failed(err);
  }
}

// ── Operations ────────────────────────────────────────────────────────────

export async function runDispatcherAction(): Promise<DevResult> {
  try {
    await assertDeveloper();
    const started = Date.now();
    const reminders = await sweepDueDates();
    const email = await dispatchPendingEmails(100);
    return { ok: true, message: `Dispatcher ran in ${Date.now() - started} ms.`, output: pretty({ reminders, email }) };
  } catch (err) {
    return failed(err);
  }
}

export async function requeueFailedAiJobsAction(): Promise<DevResult> {
  try {
    await assertDeveloper();
    const rows = await db
      .select()
      .from(aiJobs)
      .where(inArray(aiJobs.status, ["failed", "skipped"]))
      .orderBy(desc(aiJobs.createdAt))
      .limit(50);
    let requeued = 0;
    for (const row of rows) {
      await db
        .update(aiJobs)
        .set({ status: "queued", error: null, attempts: 0, startedAt: null, completedAt: null })
        .where(eq(aiJobs.id, row.id));
      await enqueueAiJob({
        tenantId: row.tenantId,
        aiJobId: row.id,
        jobType: row.jobType as AiJobData["jobType"],
        input: (typeof row.input === "string" ? JSON.parse(row.input) : row.input) as Record<string, unknown>,
      });
      requeued++;
    }
    revalidatePath("/admin/developer");
    return { ok: true, message: `${requeued} AI job(s) re-queued (newest 50 failed/skipped).` };
  } catch (err) {
    return failed(err);
  }
}

export async function purgeQueueAction(): Promise<DevResult> {
  try {
    await assertDeveloper();
    const cutoff = new Date(Date.now() - 24 * 3600_000);
    const result = await db
      .delete(queueJobs)
      .where(and(inArray(queueJobs.status, ["completed", "failed"]), lt(queueJobs.enqueuedAt, cutoff)));
    const affected = (result as unknown as [{ affectedRows?: number }])[0]?.affectedRows ?? 0;
    revalidatePath("/admin/developer");
    return { ok: true, message: `${affected} finished queue row(s) older than 24 h deleted.` };
  } catch (err) {
    return failed(err);
  }
}

export async function runMigrationAction(formData: FormData): Promise<DevResult> {
  try {
    await assertDeveloper();
    const which = String(formData.get("which") ?? "engine");
    const script = which === "hub" ? "scripts/migrate-hub.mjs" : "scripts/migrate-engine.mjs";
    const started = Date.now();
    const { stdout, stderr } = await execFileAsync(process.execPath, [script], {
      cwd: process.cwd(),
      timeout: 90_000,
      maxBuffer: 4 * 1024 * 1024,
    });
    return { ok: true, message: `${script} finished in ${Date.now() - started} ms.`, output: `${stdout}${stderr ? `\n[stderr]\n${stderr}` : ""}`.trim() || "(no output)" };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, message: e.message ?? "migration failed", output: `${e.stdout ?? ""}\n${e.stderr ?? ""}`.trim() };
  }
}

export async function reloadCachesAction(): Promise<DevResult> {
  try {
    await assertDeveloper();
    invalidateDevFlags();
    revalidatePath("/admin", "layout");
    revalidatePath("/engine", "layout");
    return { ok: true, message: "Flag cache cleared and admin/engine pages revalidated." };
  } catch (err) {
    return failed(err);
  }
}

// ── Raw settings ──────────────────────────────────────────────────────────

export async function saveRawSettingAction(formData: FormData): Promise<DevResult> {
  try {
    const actor = await assertDeveloper();
    const key = String(formData.get("key") ?? "").trim();
    const value = String(formData.get("value") ?? "").trim();
    if (!/^[a-zA-Z0-9_.:-]{2,120}$/.test(key)) return { ok: false, message: "Key must be 2–120 chars of letters, digits, . _ : -" };
    try {
      JSON.parse(value);
    } catch (e) {
      return { ok: false, message: `Value is not valid JSON: ${(e as Error).message}` };
    }
    await writeAnySetting(key, value, actor.uid);
    if (key === DEV_FLAGS_SETTING_KEY) invalidateDevFlags();
    revalidatePath("/admin/developer");
    revalidatePath("/admin", "layout");
    return { ok: true, message: `Saved ${key}.` };
  } catch (err) {
    return failed(err);
  }
}

export async function deleteRawSettingAction(formData: FormData): Promise<DevResult> {
  try {
    await assertDeveloper();
    const key = String(formData.get("key") ?? "").trim();
    if (!key) return { ok: false, message: "No key." };
    await deleteAnySetting(key);
    if (key === DEV_FLAGS_SETTING_KEY) invalidateDevFlags();
    revalidatePath("/admin/developer");
    revalidatePath("/admin", "layout");
    return { ok: true, message: `Deleted ${key} — its defaults apply again.` };
  } catch (err) {
    return failed(err);
  }
}

/** Mark all of a user's unread notifications read — handy after test bursts. */
export async function clearMyNotificationsAction(): Promise<DevResult> {
  try {
    const actor = await assertDeveloper();
    const r = await prisma.notification.updateMany({ where: { userId: actor.uid, readAt: null }, data: { readAt: new Date() } });
    revalidatePath("/admin", "layout");
    return { ok: true, message: `${r.count} notification(s) marked read.` };
  } catch (err) {
    return failed(err);
  }
}
