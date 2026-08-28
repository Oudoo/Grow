"use client";

import { useMemo, useState } from "react";
import {
  Plus, Trash2, CheckCircle2, Circle, MessageSquare, Paperclip, User,
  Clock, Briefcase, CalendarDays, Flag, Search, AlertTriangle,
} from "lucide-react";
import {
  createTaskAction,
  updateTaskStatusAction,
  updateTaskAssigneeAction,
  updateTaskPriorityAction,
  updateTaskDueDateAction,
  updateTaskDescriptionAction,
  deleteTaskAction,
  createSubTaskAction,
  toggleSubTaskAction,
  deleteSubTaskAction,
  addCommentAction,
  addAttachmentAction,
  deleteAttachmentAction,
  updateTaskTitleAction,
  updateSubTaskTitleAction,
} from "../actions";
import type { Project, Task, SubTask, Comment, Attachment } from "@/generated/prisma";
import type { DirectoryOption } from "@/lib/directory";
import {
  PRIORITIES, PRIORITY_LABEL, PRIORITY_STYLE, PRIORITY_RANK,
  dueLabel, formatDueDate, isOverdue, normalisePriority, type Priority,
} from "@/lib/projects";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { MentionText } from "@/components/mentions/MentionText";
import { ActivityTimeline } from "./ActivityTimeline";

type TaskWithRelations = Task & {
  subTasks: SubTask[];
  comments: Comment[];
  attachments: Attachment[];
};
type ProjectWithTasks = Project & { tasks: TaskWithRelations[] };

/** Directory entries usable as mention candidates (drops the Unassigned row). */
function mentionable(directory: DirectoryOption[]) {
  return directory.filter((d) => d.id !== "");
}

export function ClientProjectBoard({
  project,
  directory,
  currentUserId,
  initialTaskId,
}: {
  project: ProjectWithTasks;
  /** Everyone in IAM who can open the projects module. */
  directory: DirectoryOption[];
  currentUserId: string;
  /** Task to open on load — set when arriving from a notification link. */
  initialTaskId?: string | null;
}) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initialTaskId ?? null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | Priority>("ALL");
  const [mineOnly, setMineOnly] = useState(false);

  const candidates = useMemo(() => mentionable(directory), [directory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return project.tasks
      .filter((t) => {
        if (mineOnly && t.assigneeId !== currentUserId) return false;
        if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)
        );
      })
      // Most urgent first, then soonest due. Tasks with no due date sort last
      // rather than first, which is what an empty date would otherwise do.
      .sort((a, b) => {
        const p = (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2);
        if (p !== 0) return p;
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return ad - bd;
      });
  }, [project.tasks, search, priorityFilter, mineOnly, currentUserId]);

  const byStatus = (s: string) => filtered.filter((t) => t.status === s);
  const pendingTasks = byStatus("PENDING");
  const inProgressTasks = byStatus("IN_PROGRESS");
  const doneTasks = byStatus("DONE");

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const projectProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const overdueCount = project.tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  // Resolve from the live list so the panel reflects the latest server data
  // after a revalidation, rather than a stale snapshot taken when it opened.
  const activeTask = activeTaskId ? project.tasks.find((t) => t.id === activeTaskId) ?? null : null;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="bg-obsidian border border-fg/10 rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6 gap-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-platinum mb-2">{project.title}</h1>
            {project.description && <p className="text-slate">{project.description}</p>}
            {overdueCount > 0 && (
              <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overdueCount} overdue {overdueCount === 1 ? "task" : "tasks"}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-cyan">{projectProgress}%</div>
            <div className="text-xs text-slate uppercase tracking-wider">Overall Progress</div>
          </div>
        </div>
        <div className="w-full bg-void rounded-full h-3 overflow-hidden">
          <div
            className="bg-cyan h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${projectProgress}%` }}
          />
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, owners, descriptions…"
            className="w-full bg-obsidian border border-fg/10 rounded-xl pl-9 pr-3 py-2 text-sm text-platinum outline-none focus:border-cyan"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as "ALL" | Priority)}
          className="bg-obsidian border border-fg/10 rounded-xl px-3 py-2 text-sm text-platinum outline-none focus:border-cyan"
        >
          <option value="ALL">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setMineOnly((v) => !v)}
          aria-pressed={mineOnly}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
            mineOnly
              ? "bg-cyan text-void border-cyan"
              : "bg-obsidian text-slate border-fg/10 hover:text-platinum"
          }`}
        >
          My tasks
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Kanban ── */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <ColumnHeader icon={<Circle className="w-4 h-4 text-slate" />} label="Pending" count={pendingTasks.length} />

            <form
              action={(data) => createTaskAction(project.id, data)}
              className="bg-obsidian border border-fg/10 border-dashed rounded-xl p-4 space-y-3"
            >
              <input
                name="title"
                required
                placeholder="New task…"
                className="w-full bg-transparent text-platinum placeholder-slate/50 outline-none text-sm"
              />
              <select
                name="assigneeId"
                defaultValue=""
                className="w-full bg-void text-slate text-xs border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
              >
                {directory.map((m) => (
                  <option key={m.id || "unassigned"} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="priority"
                  defaultValue="MEDIUM"
                  className="bg-void text-slate text-xs border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                  ))}
                </select>
                <input
                  type="date"
                  name="dueDate"
                  title="Due date"
                  className="bg-void text-slate text-xs border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-cyan/10 text-cyan hover:bg-cyan hover:text-void text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Task
              </button>
            </form>

            {pendingTasks.map((t) => (
              <TaskCard key={t.id} task={t} onClick={() => setActiveTaskId(t.id)} />
            ))}
          </div>

          <div className="space-y-4">
            <ColumnHeader icon={<Clock className="w-4 h-4 text-blue-400" />} label="In Progress" count={inProgressTasks.length} />
            {inProgressTasks.map((t) => (
              <TaskCard key={t.id} task={t} onClick={() => setActiveTaskId(t.id)} />
            ))}
          </div>

          <div className="space-y-4">
            <ColumnHeader icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} label="Done" count={doneTasks.length} />
            {doneTasks.map((t) => (
              <TaskCard key={t.id} task={t} onClick={() => setActiveTaskId(t.id)} />
            ))}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="lg:col-span-1">
          {activeTask ? (
            <div className="bg-obsidian border border-fg/10 rounded-2xl p-6 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <div className="flex justify-between items-start mb-4 gap-2">
                <input
                  key={`title-${activeTask.id}`}
                  defaultValue={activeTask.title}
                  onBlur={(e) => updateTaskTitleAction(activeTask.id, project.id, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  className="text-xl font-bold text-platinum bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan rounded px-1 w-full"
                />
                <button
                  onClick={() => {
                    deleteTaskAction(activeTask.id, project.id);
                    setActiveTaskId(null);
                  }}
                  aria-label="Delete task"
                  className="text-slate hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Description — supports @mentions */}
              <div className="mb-5">
                <label className="block text-xs text-slate mb-1">Description</label>
                <MentionTextarea
                  key={`desc-${activeTask.id}`}
                  name="description"
                  rows={3}
                  directory={candidates}
                  defaultValue={activeTask.description ?? ""}
                  placeholder="Add detail… type @ to mention someone"
                  onBlur={(value) => updateTaskDescriptionAction(activeTask.id, project.id, value)}
                />
              </div>

              {/* Controls */}
              <div className="space-y-3 mb-6 border-b border-fg/10 pb-6">
                <Field label="Status">
                  <select
                    value={activeTask.status}
                    onChange={(e) => updateTaskStatusAction(activeTask.id, project.id, e.target.value)}
                    className="w-full bg-void text-platinum text-sm border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </Field>

                <Field label="Owner">
                  <select
                    value={activeTask.assigneeId ?? ""}
                    onChange={(e) => updateTaskAssigneeAction(activeTask.id, project.id, e.target.value)}
                    className="w-full bg-void text-platinum text-sm border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                  >
                    {directory.map((m) => (
                      <option key={m.id || "unassigned"} value={m.id}>{m.name}</option>
                    ))}
                    {/* An owner who has since lost access is not in the picker
                        list, so without this the select would fall back to
                        showing the first option and misreport who owns the
                        task. Choosing anyone else still reassigns normally. */}
                    {activeTask.assigneeId &&
                      !directory.some((d) => d.id === activeTask.assigneeId) && (
                        <option value={activeTask.assigneeId}>{activeTask.assignee} (no access)</option>
                      )}
                  </select>
                </Field>

                <Field label="Priority">
                  <select
                    value={activeTask.priority}
                    onChange={(e) => updateTaskPriorityAction(activeTask.id, project.id, e.target.value)}
                    className="w-full bg-void text-platinum text-sm border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Due date">
                  <input
                    type="date"
                    key={`due-${activeTask.id}`}
                    defaultValue={formatDueDate(activeTask.dueDate) ?? ""}
                    onChange={(e) => updateTaskDueDateAction(activeTask.id, project.id, e.target.value)}
                    className="w-full bg-void text-platinum text-sm border border-fg/10 rounded-lg p-2 outline-none focus:border-cyan"
                  />
                  {isOverdue(activeTask.dueDate, activeTask.status) && (
                    <p className="mt-1 text-xs text-red-400 font-semibold">
                      {dueLabel(activeTask.dueDate, activeTask.status)}
                    </p>
                  )}
                </Field>
              </div>

              {/* Subtasks */}
              <section className="mb-6">
                <h3 className="font-bold text-sm text-platinum mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Subtasks
                </h3>

                {activeTask.subTasks.length > 0 && (() => {
                  const done = activeTask.subTasks.filter((s) => s.isCompleted).length;
                  const pct = Math.round((done / activeTask.subTasks.length) * 100);
                  return (
                    <div className="w-full bg-void rounded-full h-1.5 mb-3 overflow-hidden">
                      <div className="bg-cyan h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  );
                })()}

                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                  {activeTask.subTasks.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={sub.isCompleted}
                        onChange={(e) => toggleSubTaskAction(sub.id, project.id, e.target.checked)}
                        className="accent-cyan w-4 h-4"
                      />
                      <input
                        defaultValue={sub.title}
                        onBlur={(e) => updateSubTaskTitleAction(sub.id, project.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        className={`text-sm flex-1 bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan rounded px-1 ${
                          sub.isCompleted ? "text-slate line-through" : "text-platinum"
                        }`}
                      />
                      <button
                        onClick={() => deleteSubTaskAction(sub.id, project.id)}
                        aria-label="Delete subtask"
                        className="opacity-0 group-hover:opacity-100 text-slate hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <form action={(d) => createSubTaskAction(activeTask.id, project.id, d)} className="flex gap-2">
                  <input
                    name="title"
                    placeholder="Add subtask…"
                    required
                    className="flex-1 bg-void border border-fg/10 rounded-lg px-3 py-1.5 text-sm text-platinum outline-none focus:border-cyan"
                  />
                  <button type="submit" aria-label="Add subtask" className="bg-fg/10 text-platinum hover:bg-cyan hover:text-void px-3 rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </section>

              {/* Attachments */}
              <section className="mb-6">
                <h3 className="font-bold text-sm text-platinum mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> Links & Attachments
                </h3>
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {activeTask.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between bg-void p-2 rounded-lg group">
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-cyan text-xs truncate max-w-[200px] hover:underline"
                      >
                        {att.name}
                      </a>
                      <button
                        onClick={() => deleteAttachmentAction(att.id, project.id)}
                        aria-label="Remove link"
                        className="opacity-0 group-hover:opacity-100 text-slate hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <form action={(d) => addAttachmentAction(activeTask.id, project.id, d)} className="space-y-2">
                  <input name="name" placeholder="Link name (e.g. Design doc)" required className="w-full bg-void border border-fg/10 rounded-lg px-3 py-1.5 text-sm text-platinum outline-none focus:border-cyan" />
                  <input name="url" type="url" placeholder="https://…" required className="w-full bg-void border border-fg/10 rounded-lg px-3 py-1.5 text-sm text-platinum outline-none focus:border-cyan" />
                  <button type="submit" className="w-full bg-fg/10 text-platinum hover:bg-cyan hover:text-void text-xs font-bold py-1.5 rounded-lg">Add Link</button>
                </form>
              </section>

              {/* Comments */}
              <section>
                <h3 className="font-bold text-sm text-platinum mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Comments
                </h3>
                <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                  {activeTask.comments.map((c) => (
                    <div key={c.id} className="bg-void p-3 rounded-xl border border-fg/5">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <span className="text-xs font-bold text-cyan truncate">{c.author}</span>
                        <span className="text-[10px] text-slate shrink-0">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <MentionText text={c.content} directory={candidates} className="text-sm text-platinum" />
                    </div>
                  ))}
                </div>
                <form
                  key={`comment-${activeTask.id}`}
                  action={(d) => addCommentAction(activeTask.id, project.id, d)}
                  className="space-y-2"
                >
                  <MentionTextarea
                    name="content"
                    rows={2}
                    required
                    directory={candidates}
                    placeholder="Add a comment… type @ to mention someone"
                  />
                  <button type="submit" className="w-full bg-cyan/10 text-cyan hover:bg-cyan hover:text-void text-xs font-bold py-1.5 rounded-lg">
                    Post Comment
                  </button>
                </form>
              </section>

              <ActivityTimeline taskId={activeTask.id} />
            </div>
          ) : (
            <div className="bg-obsidian border border-fg/10 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center h-full text-slate">
              <Briefcase className="w-10 h-10 mb-3 opacity-20" />
              <p>Select a task to view its details, subtasks, and comments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ColumnHeader({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between border-b border-fg/10 pb-2">
      <h3 className="font-bold text-platinum flex items-center gap-2">{icon} {label}</h3>
      <span className="bg-void text-slate text-xs px-2 py-1 rounded-full">{count}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate mb-1">{label}</label>
      {children}
    </div>
  );
}

function TaskCard({ task, onClick }: { task: TaskWithRelations; onClick: () => void }) {
  const subTotal = task.subTasks.length;
  const subDone = task.subTasks.filter((s) => s.isCompleted).length;
  const subProg = subTotal === 0 ? 0 : Math.round((subDone / subTotal) * 100);
  const overdue = isOverdue(task.dueDate, task.status);
  const due = dueLabel(task.dueDate, task.status);
  // Validate rather than cast: a stray value would otherwise index
  // PRIORITY_STYLE to undefined and render className="undefined".
  const priority = normalisePriority(task.priority);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onClick())}
      className="bg-obsidian border border-fg/10 rounded-xl p-4 cursor-pointer hover:border-cyan/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-bold text-platinum text-sm group-hover:text-cyan transition-colors">{task.title}</h4>
        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${PRIORITY_STYLE[priority]}`}>
          <Flag className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
          {PRIORITY_LABEL[priority]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-slate bg-void px-2 py-1 rounded-md">
          <User className="w-3 h-3" />
          {task.assignee}
        </span>
        {due && (
          <span
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
              overdue ? "bg-red-500/15 text-red-400 font-semibold" : "bg-void text-slate"
            }`}
          >
            <CalendarDays className="w-3 h-3" />
            {due}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate">
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {subDone}/{subTotal}</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {task.comments.length}</span>
        <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {task.attachments.length}</span>
      </div>

      {subTotal > 0 && (
        <div className="w-full bg-void rounded-full h-1 mt-3 overflow-hidden">
          <div className="bg-cyan h-1 rounded-full transition-all" style={{ width: `${subProg}%` }} />
        </div>
      )}
    </div>
  );
}
