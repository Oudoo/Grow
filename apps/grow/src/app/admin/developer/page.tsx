import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { TerminalSquare } from "lucide-react";
import { desc, gte, sql } from "drizzle-orm";
import { db, aiJobs, costTracking, domainEvents, meetings } from "@growengine/db";
import { DEV_FLAG_DEFS, getDevFlags, getSystemHealth, isMayaConfigured, type DevFlagKey } from "@growengine/core";
import { getSession } from "@/lib/auth";
import { isDeveloper, developerEmails } from "@/lib/access";
import { prisma } from "@/lib/db";
import { listAllSettings } from "@/lib/settings";
import { DevForm } from "./DevForm";
import {
  clearMyNotificationsAction,
  deleteRawSettingAction,
  purgeQueueAction,
  reloadCachesAction,
  requeueFailedAiJobsAction,
  runDispatcherAction,
  runMigrationAction,
  saveFlagsAction,
  saveRawSettingAction,
  testAiAction,
  testMailAction,
  testNotificationAction,
  testVexaAction,
} from "./actions";

export const dynamic = "force-dynamic";

/**
 * The Developer console — the owner's view of, and switches for, the running
 * system. Gated three times: middleware (route), this page (notFound), and
 * every action (assertDeveloper). Everything here is read live; nothing is
 * cached beyond the 15-second flag cache.
 */

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[developer] ${label}:`, e);
    return fallback;
  }
}

function buildId(): string {
  try {
    return readFileSync(".next/BUILD_ID", "utf8").trim();
  } catch {
    return "dev";
  }
}

// Helpers keep the impure clock calls out of the component body (react-hooks/purity).
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);
const mb = (n: number) => `${Math.round(n / 1024 / 1024)} MB`;
const ago = (d: Date | string | null | undefined) => {
  if (!d) return "—";
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.round(ms / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};

export default async function DeveloperPage() {
  const session = await getSession();
  if (!session || !isDeveloper(session)) notFound();

  const since30d = daysAgo(30);
  const [flags, health, recentJobs, cost, events, settings, liveMeetings, outbox, engineMigrations] = await Promise.all([
    getDevFlags(),
    safe("health", () => getSystemHealth(), null),
    safe("ai jobs", () => db.select().from(aiJobs).orderBy(desc(aiJobs.createdAt)).limit(15), []),
    safe(
      "cost",
      async () => {
        const [row] = await db
          .select({ usd: sql<string>`coalesce(sum(${costTracking.costUsd}), 0)`, calls: sql<number>`count(*)` })
          .from(costTracking)
          .where(gte(costTracking.createdAt, since30d));
        return { usd: Number(row?.usd ?? 0), calls: Number(row?.calls ?? 0) };
      },
      { usd: 0, calls: 0 }
    ),
    safe("events", () => db.select().from(domainEvents).orderBy(desc(domainEvents.occurredAt)).limit(15), []),
    listAllSettings(),
    safe("live meetings", async () => {
      const [row] = await db
        .select({ n: sql<number>`count(*)` })
        .from(meetings)
        .where(sql`${meetings.botMeetingId} is not null and ${meetings.botEndedAt} is null`);
      return Number(row?.n ?? 0);
    }, 0),
    safe("outbox", () => prisma.notification.count({ where: { emailedAt: null, emailAttempts: { lt: 3 } } }), 0),
    safe(
      "migrations",
      async () => {
        const [row] = await prisma.$queryRaw<{ n: bigint | number }[]>`SELECT COUNT(*) AS n FROM __drizzle_migrations`;
        return Number(row?.n ?? 0);
      },
      -1
    ),
  ]);

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    SMTP: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    CRON_SECRET: Boolean(process.env.CRON_SECRET),
    ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    VEXA_API_KEY: isMayaConfigured(),
    VEXA_WEBHOOK_SECRET: Boolean(process.env.VEXA_WEBHOOK_SECRET),
    TWILIO: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  };
  const mem = process.memoryUsage();
  const uptimeMin = Math.round(process.uptime() / 60);

  // min-w-0: a grid item otherwise refuses to shrink below its content's
  // intrinsic width, which on a phone pushed the Runtime card past the screen.
  const card = "min-w-0 overflow-hidden rounded-xl border border-fg/5 bg-obsidian p-5";
  const h2 = "mb-3 font-heading text-lg font-bold text-platinum";
  const kv = "flex items-center justify-between gap-3 border-b border-fg/5 py-1.5 text-sm last:border-0";
  // Values truncate rather than push the card wider than a phone.
  const kvv = "min-w-0 truncate text-right text-platinum";
  const dot = (ok: boolean) => (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} aria-label={ok ? "on" : "off"} />
  );

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 font-heading text-3xl font-bold text-platinum">
          <TerminalSquare className="h-8 w-8 text-cyan" />
          Developer console
        </h1>
        <p className="text-slate">
          Visible to {developerEmails().join(", ")} only. Switches take effect within 15 seconds without a
          deploy; every button shows exactly what it did.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Runtime ─────────────────────────────────────────────── */}
        <section className={card}>
          <h2 className={h2}>Runtime</h2>
          <div className={kv}><span className="text-slate">Build</span><span className={`${kvv} font-mono`}>{buildId()}</span></div>
          <div className={kv}><span className="text-slate">Node</span><span className={`${kvv} font-mono`}>{process.version}</span></div>
          <div className={kv}><span className="text-slate">Process up</span><span className={kvv}>{uptimeMin} min · RSS {mb(mem.rss)}</span></div>
          <div className={kv}><span className="text-slate">Working directory</span><span className={`${kvv} font-mono text-xs`} title={process.cwd()}>{process.cwd().split("/").slice(-3).join("/")}</span></div>
          <div className={kv}><span className="text-slate">Secrets file</span><span className={kvv}>{process.env.GROW_ENV_SOURCE ?? "none"}{process.env.GROW_ENV_SECONDARY ? ` + ${process.env.GROW_ENV_SECONDARY}` : ""}</span></div>
          <div className={kv}><span className="text-slate">Database</span><span className={kvv} title={engineMigrations >= 0 ? `${engineMigrations} engine migrations recorded` : ""}>{health ? `${health.database.ok ? "ok" : "DOWN"} · ${health.database.latencyMs} ms` : "unknown"}{engineMigrations >= 0 ? ` · ${engineMigrations} migrations` : ""}</span></div>
          <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {Object.entries(env).map(([k, ok]) => (
              <div key={k} className="flex min-w-0 items-center gap-2 py-1 text-xs text-slate">
                {dot(ok)}
                <span className="truncate font-mono" title={k}>{k}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Switches ─────────────────────────────────────────────── */}
        <section className={card}>
          <h2 className={h2}>Switches</h2>
          <DevForm action={saveFlagsAction} submitLabel="Save switches" className="space-y-3">
            {(Object.keys(DEV_FLAG_DEFS) as DevFlagKey[]).map((key) => {
              const def = DEV_FLAG_DEFS[key];
              const value = flags[key];
              return (
                <div key={key} className="rounded-lg border border-fg/5 p-3">
                  <label className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-sm font-semibold text-platinum">{def.label}</span>
                      <span className="block text-xs text-slate">{def.help}</span>
                      <span className="mt-1 block font-mono text-[10px] text-slate/60">{key}</span>
                    </span>
                    {def.kind === "boolean" ? (
                      <input type="checkbox" name={key} defaultChecked={Boolean(value)} className="mt-1 h-5 w-5 shrink-0 accent-cyan" />
                    ) : def.kind === "select" ? (
                      <select name={key} defaultValue={String(value)} className="shrink-0 rounded-md border border-fg/10 bg-void px-2 py-1 text-sm text-platinum">
                        {def.options.map((o) => <option key={o} value={o}>{o || "(env default)"}</option>)}
                      </select>
                    ) : (
                      <input name={key} defaultValue={String(value)} placeholder="(none)" className="w-56 shrink-0 rounded-md border border-fg/10 bg-void px-2 py-1 text-sm text-platinum" />
                    )}
                  </label>
                </div>
              );
            })}
          </DevForm>
        </section>

        {/* ── Probes ───────────────────────────────────────────────── */}
        <section className={card}>
          <h2 className={h2}>Probes</h2>
          <p className="mb-3 text-xs text-slate">Each one makes a real call and shows the raw answer.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <DevForm action={testAiAction} submitLabel="Test AI (active provider)" />
            <DevForm action={testAiAction} submitLabel="Test Gemini key">
              <input type="hidden" name="provider" value="gemini" />
            </DevForm>
            <DevForm action={testAiAction} submitLabel="Test Claude key">
              <input type="hidden" name="provider" value="anthropic" />
            </DevForm>
            <DevForm action={testVexaAction} submitLabel="Test Vexa (Maya) key" />
            <DevForm action={testMailAction} submitLabel="Send me a test email" />
            <DevForm action={testNotificationAction} submitLabel="Send me a test notification" />
          </div>
        </section>

        {/* ── Operations ───────────────────────────────────────────── */}
        <section className={card}>
          <h2 className={h2}>Operations</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DevForm action={runDispatcherAction} submitLabel="Run dispatcher now" confirm="Sweep due dates and send every queued email now?" />
            <DevForm action={requeueFailedAiJobsAction} submitLabel="Re-queue failed AI jobs" confirm="Re-queue the newest 50 failed/skipped AI jobs?" />
            <DevForm action={purgeQueueAction} submitLabel="Purge finished queue rows" confirm="Delete completed/failed queue rows older than 24 hours?" danger />
            <DevForm action={reloadCachesAction} submitLabel="Reload caches" />
            <DevForm action={runMigrationAction} submitLabel="Check engine schema" confirm="Run scripts/migrate-engine.mjs now? (additive, idempotent)">
              <input type="hidden" name="which" value="engine" />
            </DevForm>
            <DevForm action={runMigrationAction} submitLabel="Check hub schema" confirm="Run scripts/migrate-hub.mjs now? (additive, idempotent)">
              <input type="hidden" name="which" value="hub" />
            </DevForm>
            <DevForm action={clearMyNotificationsAction} submitLabel="Mark my notifications read" />
          </div>
        </section>

        {/* ── Queues & workers ─────────────────────────────────────── */}
        <section className={card}>
          <h2 className={h2}>Queues and workers</h2>
          {health ? (
            <>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate"><th className="py-1">queue</th><th>waiting</th><th>active</th><th>failed</th><th>completed</th></tr></thead>
                <tbody>
                  {Object.entries(health.queues).map(([q, s]) => (
                    <tr key={q} className="border-t border-fg/5 text-platinum"><td className="py-1 font-mono">{q}</td><td>{s.waiting}</td><td>{s.active}</td><td className={s.failed ? "text-red-300" : ""}>{s.failed}</td><td>{s.completed}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex flex-wrap gap-2">
                {health.workers.map((w) => (
                  <span key={w.name} className={`rounded-full px-2.5 py-0.5 text-xs ${w.healthy ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                    {w.name} · {w.lastHeartbeat ? ago(w.lastHeartbeat) : "no heartbeat"}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate">Health unavailable.</p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-void p-2"><div className="text-lg font-bold text-platinum">{liveMeetings}</div><div className="text-slate">Maya in meetings</div></div>
            <div className="rounded-lg bg-void p-2"><div className="text-lg font-bold text-platinum">{outbox}</div><div className="text-slate">emails queued</div></div>
            <div className="rounded-lg bg-void p-2"><div className="text-lg font-bold text-platinum">${cost.usd.toFixed(2)}</div><div className="text-slate">AI spend, 30 d ({cost.calls} calls)</div></div>
          </div>
        </section>

        {/* ── AI jobs ──────────────────────────────────────────────── */}
        <section className={card}>
          <h2 className={h2}>Last 15 AI jobs</h2>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-slate"><th className="py-1">type</th><th>status</th><th>when</th><th>error</th></tr></thead>
              <tbody>
                {recentJobs.map((j) => (
                  <tr key={j.id} className="border-t border-fg/5 text-platinum align-top">
                    <td className="py-1 font-mono">{j.jobType}</td>
                    <td className={j.status === "failed" ? "text-red-300" : j.status === "completed" ? "text-emerald-300" : "text-amber-300"}>{j.status}</td>
                    <td className="whitespace-nowrap text-slate">{ago(j.createdAt)}</td>
                    <td className="max-w-[16rem] truncate text-slate" title={j.error ?? ""}>{j.error ?? ""}</td>
                  </tr>
                ))}
                {recentJobs.length === 0 && <tr><td colSpan={4} className="py-2 text-slate">No AI jobs yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Events ───────────────────────────────────────────────── */}
        <section className={card}>
          <h2 className={h2}>Last 15 domain events</h2>
          <div className="max-h-80 overflow-auto">
            {events.map((e) => (
              <div key={e.id} className="border-t border-fg/5 py-1.5 text-xs first:border-0">
                <span className="font-mono text-platinum">{e.eventType}</span>
                <span className="text-slate"> · {e.entityType ?? ""} · {ago(e.occurredAt)} · {e.dispatchStatus}</span>
              </div>
            ))}
            {events.length === 0 && <p className="text-xs text-slate">No events yet.</p>}
          </div>
        </section>

        {/* ── Raw settings ─────────────────────────────────────────── */}
        <section className={`${card} lg:col-span-2`}>
          <h2 className={h2}>Every setting, raw</h2>
          <p className="mb-3 text-xs text-slate">
            The SystemSetting table as it is. Values are JSON; a malformed value makes the owning page fall back to
            its defaults rather than break. Deleting a key restores defaults.
          </p>
          <div className="space-y-3">
            {settings.map((s) => (
              <div key={s.key} className="rounded-lg border border-fg/5 p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-slate">
                  <span className="font-mono text-platinum">{s.key}</span>
                  <span>updated {ago(s.updatedAt)}{s.updatedBy ? ` by ${s.updatedBy.slice(0, 8)}…` : ""}</span>
                </div>
                <DevForm action={saveRawSettingAction} submitLabel="Save">
                  <input type="hidden" name="key" value={s.key} />
                  <textarea name="value" defaultValue={s.value} rows={Math.min(12, Math.max(2, s.value.split("\n").length + 1))} className="w-full rounded-md border border-fg/10 bg-void p-2 font-mono text-xs text-platinum" />
                </DevForm>
                <DevForm action={deleteRawSettingAction} submitLabel="Delete key" confirm={`Delete ${s.key}? Its defaults apply again.`} danger className="mt-1">
                  <input type="hidden" name="key" value={s.key} />
                </DevForm>
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-fg/10 p-3">
              <div className="mb-2 text-xs text-slate">New key</div>
              <DevForm action={saveRawSettingAction} submitLabel="Create">
                <input name="key" placeholder="e.g. developer.flags" className="mb-2 w-full rounded-md border border-fg/10 bg-void p-2 font-mono text-xs text-platinum" />
                <textarea name="value" placeholder='{"example": true}' rows={3} className="w-full rounded-md border border-fg/10 bg-void p-2 font-mono text-xs text-platinum" />
              </DevForm>
            </div>
          </div>
        </section>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-slate/70">
        Runtime logs are not readable from inside the process — use the Hostinger runtime-log tool
        (HANDOVER §7.4). Secrets are shown as present/absent only, never as values.
      </p>
    </div>
  );
}
