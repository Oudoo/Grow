import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, Clock,
  Flag, Inbox, ListChecks, UserRound,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";
import { unreadCount } from "@/lib/notify";
import {
  PRIORITY_LABEL, PRIORITY_STYLE, PRIORITY_RANK,
  dueLabel, isOverdue, daysUntilDue, type Priority,
} from "@/lib/projects";

export const dynamic = "force-dynamic";

/**
 * "My Work" — every open task owned by the signed-in person, across all
 * projects.
 *
 * This is the payoff of linking tasks to IAM accounts: ownership used to be a
 * free-text name, so there was no way to ask "what is assigned to me?" without
 * string-matching. Now it is one indexed query on assigneeId.
 */

type Row = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  projectId: string;
  project: { title: string };
  subTasks: { isCompleted: boolean }[];
};

/**
 * Split into buckets by urgency. Anything overdue leads, because a list that
 * buries late work under a flat date sort is how deadlines get missed.
 */
function bucket(tasks: Row[]) {
  const overdue: Row[] = [];
  const soon: Row[] = [];
  const later: Row[] = [];
  const noDate: Row[] = [];

  for (const t of tasks) {
    if (isOverdue(t.dueDate, t.status)) { overdue.push(t); continue; }
    const days = daysUntilDue(t.dueDate);
    if (days === null) noDate.push(t);
    else if (days <= 7) soon.push(t);
    else later.push(t);
  }
  return { overdue, soon, later, noDate };
}

export default async function MyWorkPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, session.access, "projects", "view")) redirect("/admin");

  let tasks: Row[] = [];
  let unread = 0;
  try {
    [tasks, unread] = await Promise.all([
      prisma.task.findMany({
        where: { assigneeId: session.uid },
        select: {
          id: true, title: true, status: true, priority: true, dueDate: true,
          projectId: true,
          project: { select: { title: true } },
          subTasks: { select: { isCompleted: true } },
        },
        orderBy: [{ dueDate: "asc" }],
      }),
      unreadCount(session.uid),
    ]);
  } catch (e) {
    console.error("[my-work] query failed:", e);
  }

  const open = tasks
    .filter((t) => t.status !== "DONE")
    .sort((a, b) => (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2));
  const done = tasks.filter((t) => t.status === "DONE");
  const { overdue, soon, later, noDate } = bucket(open);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
            <UserRound className="w-8 h-8 text-cyan" />
            My Work
          </h1>
          <p className="text-slate">
            Everything assigned to {session.name}, across every project.
          </p>
        </div>
        <Link
          href="/admin/notifications"
          className="shrink-0 flex items-center gap-2 bg-obsidian border border-fg/10 hover:border-cyan/40 rounded-xl px-4 py-2.5 text-sm text-slate hover:text-platinum transition-colors"
        >
          <Inbox className="w-4 h-4" />
          Notifications
          {unread > 0 && (
            <span className="bg-cyan text-void text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Open" value={open.length} icon={<ListChecks className="w-4 h-4" />} />
        <Stat label="Overdue" value={overdue.length} icon={<AlertTriangle className="w-4 h-4" />} tone={overdue.length > 0 ? "danger" : undefined} />
        <Stat label="Due in 7 days" value={soon.length} icon={<CalendarDays className="w-4 h-4" />} />
        <Stat label="Completed" value={done.length} icon={<CheckCircle2 className="w-4 h-4" />} />
      </div>

      {open.length === 0 && (
        <div className="text-center py-16 border border-fg/5 border-dashed rounded-2xl text-slate">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>Nothing assigned to you right now.</p>
        </div>
      )}

      <Group title="Overdue" tone="danger" tasks={overdue} />
      <Group title="Due this week" tasks={soon} />
      <Group title="Upcoming" tasks={later} />
      <Group title="No due date" tasks={noDate} />
    </div>
  );
}

function Stat({
  label, value, icon, tone,
}: { label: string; value: number; icon: React.ReactNode; tone?: "danger" }) {
  return (
    <div className={`rounded-2xl border p-4 ${
      tone === "danger" ? "bg-red-500/10 border-red-500/25" : "bg-obsidian border-fg/10"
    }`}>
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider mb-2 ${
        tone === "danger" ? "text-red-400" : "text-slate"
      }`}>
        {icon} {label}
      </div>
      <div className={`text-2xl font-bold ${tone === "danger" ? "text-red-400" : "text-platinum"}`}>
        {value}
      </div>
    </div>
  );
}

function Group({ title, tasks, tone }: { title: string; tasks: Row[]; tone?: "danger" }) {
  if (tasks.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
        tone === "danger" ? "text-red-400" : "text-slate"
      }`}>
        {title} <span className="opacity-60">({tasks.length})</span>
      </h2>
      <ul className="space-y-2">
        {tasks.map((t) => {
          const priority = (t.priority as Priority) ?? "MEDIUM";
          const due = dueLabel(t.dueDate, t.status);
          const overdue = isOverdue(t.dueDate, t.status);
          const subDone = t.subTasks.filter((s) => s.isCompleted).length;

          return (
            <li key={t.id}>
              <Link
                href={`/admin/projects/${t.projectId}?task=${t.id}`}
                className="flex items-center gap-4 bg-obsidian border border-fg/10 hover:border-cyan/40 rounded-xl p-4 transition-colors group"
              >
                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${PRIORITY_STYLE[priority]}`}>
                  <Flag className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
                  {PRIORITY_LABEL[priority]}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-platinum group-hover:text-cyan transition-colors truncate">
                    {t.title}
                  </p>
                  <p className="text-xs text-slate truncate">{t.project.title}</p>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-xs text-slate shrink-0">
                  {t.status === "IN_PROGRESS" && (
                    <span className="flex items-center gap-1 text-blue-400"><Clock className="w-3 h-3" /> In progress</span>
                  )}
                  {t.subTasks.length > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {subDone}/{t.subTasks.length}
                    </span>
                  )}
                  {due && (
                    <span className={overdue ? "text-red-400 font-semibold" : ""}>{due}</span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate group-hover:text-cyan transition-colors shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
