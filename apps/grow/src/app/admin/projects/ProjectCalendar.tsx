"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import {
  DAY_LABELS, dayKey, fromDayKey, indexByDay, isWeekend, monthGrid, monthLabel, shiftMonth,
} from "@/lib/calendar";
import { COLOR_BADGE, type PriorityOption, type StatusOption } from "@/lib/config-types";
import { createCalendarTaskAction } from "./actions";

/**
 * Month calendar of task deadlines across projects, with creation on a day.
 *
 * The engine has the equivalent for a client's schedule; the shared arithmetic
 * lives in lib/calendar.ts so only the presentation differs here. It has to:
 * this renders in the hub's palette, and — unlike the engine — its statuses and
 * priorities are whatever an admin has configured, so every colour and label is
 * read from configuration rather than hardcoded.
 */

export interface CalendarTask {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  projectId: string;
  projectTitle: string;
  status: string;
  priority: string;
  assignee: string;
  overdue: boolean;
}

export interface CalendarProject {
  id: string;
  title: string;
}

export function ProjectCalendar({
  tasks,
  projects,
  statuses,
  priorities,
  directory,
  canManage,
  defaultProjectId,
}: {
  tasks: CalendarTask[];
  projects: CalendarProject[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  directory: { id: string; name: string }[];
  canManage: boolean;
  /** Preselected in the create form — set when the calendar sits on one project. */
  defaultProjectId?: string;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [addingOn, setAddingOn] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>(defaultProjectId ?? "ALL");

  const visible = useMemo(
    () => (projectFilter === "ALL" ? tasks : tasks.filter((t) => t.projectId === projectFilter)),
    [tasks, projectFilter],
  );

  const grid = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const byDay = useMemo(() => indexByDay(visible), [visible]);
  const todayKey = dayKey(today);

  const priorityOf = (id: string) => priorities.find((p) => p.id === id);
  const statusOf = (id: string) => statuses.find((s) => s.id === id);

  const monthTaskCount = grid.filter((d) => d.getMonth() === cursor.month)
    .reduce((n, d) => n + (byDay.get(dayKey(d))?.length ?? 0), 0);

  function move(by: number) {
    setAddingOn(null);
    setCursor((c) => shiftMonth(c, by));
  }

  return (
    <section className="bg-obsidian border border-fg/10 rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-platinum">
            <CalendarDays className="h-5 w-5 text-cyan" />
            {monthLabel(cursor.year, cursor.month)}
          </h2>
          <p className="text-sm text-slate">
            {monthTaskCount > 0
              ? `${monthTaskCount} deadline${monthTaskCount === 1 ? "" : "s"} this month.`
              : "No deadlines this month."}
            {canManage && " Click a day to add one."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {projects.length > 1 && !defaultProjectId && (
            <select
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setAddingOn(null); }}
              aria-label="Filter by project"
              className="rounded-xl border border-fg/10 bg-void px-3 py-1.5 text-sm text-platinum outline-none focus:border-cyan"
            >
              <option value="ALL">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => move(-1)}
              aria-label="Previous month"
              className="rounded-lg border border-fg/10 p-1.5 text-slate hover:text-platinum hover:bg-fg/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setAddingOn(null); setCursor({ year: today.getFullYear(), month: today.getMonth() }); }}
              className="rounded-lg border border-fg/10 px-3 py-1.5 text-xs font-bold text-slate hover:text-platinum hover:bg-fg/5"
            >
              Today
            </button>
            <button
              onClick={() => move(1)}
              aria-label="Next month"
              className="rounded-lg border border-fg/10 p-1.5 text-slate hover:text-platinum hover:bg-fg/5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Seven columns need width to stay legible; this scrolls rather than
          letting the whole page slide sideways on a phone. */}
      <div className="overflow-x-auto">
        <div className="min-w-[44rem]">
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  [5, 6].includes(i) ? "text-slate/50" : "text-slate"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map((day) => {
              const key = dayKey(day);
              const inMonth = day.getMonth() === cursor.month;
              const isToday = key === todayKey;
              const weekend = isWeekend(day);
              const items = byDay.get(key) ?? [];

              return (
                <div
                  key={key}
                  className={`group min-h-[5.5rem] rounded-lg border p-1.5 ${
                    !inMonth
                      ? "border-fg/5 bg-void/40"
                      : weekend
                        ? "border-fg/10 bg-void"
                        : "border-fg/10 bg-obsidian"
                  } ${isToday ? "border-cyan ring-1 ring-cyan" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        !inMonth ? "text-slate/40" : isToday ? "font-bold text-cyan" : "text-platinum"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {canManage && inMonth && (
                      <button
                        type="button"
                        onClick={() => setAddingOn(addingOn === key ? null : key)}
                        aria-label={`Add a deadline on ${key}`}
                        title={`Add a deadline on ${key}`}
                        className={`rounded p-0.5 transition-opacity hover:bg-fg/10 hover:text-platinum focus:opacity-100 group-hover:opacity-100 ${
                          addingOn === key ? "bg-fg/10 text-platinum opacity-100" : "text-slate opacity-40"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((t) => {
                      const p = priorityOf(t.priority);
                      return (
                        <Link
                          key={`${t.id}-${key}`}
                          href={`/admin/projects/${t.projectId}?task=${t.id}`}
                          title={`${t.title}\n${t.projectTitle} · ${statusOf(t.status)?.label ?? t.status} · ${t.assignee}${t.overdue ? " · OVERDUE" : ""}`}
                          // Priority and lateness are INDEPENDENT facts, so they
                          // are shown independently: the fill stays the priority
                          // colour, and overdue adds a red ring plus a marker.
                          // Colouring overdue red instead made an urgent task due
                          // next week indistinguishable from one already late.
                          className={`block truncate rounded border px-1 py-0.5 text-[10px] leading-tight hover:brightness-110 ${
                            p ? COLOR_BADGE[p.color] : "border-fg/10 bg-fg/5 text-slate"
                          } ${t.overdue ? "ring-1 ring-red-500 font-bold" : ""}`}
                        >
                          {t.overdue && <span className="text-red-400" aria-hidden="true">! </span>}
                          <span className={t.overdue ? "sr-only" : "hidden"}>Overdue: </span>
                          {t.title}
                        </Link>
                      );
                    })}
                    {items.length > 3 && (
                      <div className="px-1 text-[10px] text-slate">+{items.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend from configuration, so adding a priority in Configuration shows
          up here without a code change. */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate">
        {priorities.map((p) => (
          <span key={p.id} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${COLOR_BADGE[p.color]}`} />
            {p.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-fg/10 bg-fg/5 ring-1 ring-red-500" />
          Overdue (any priority)
        </span>
        <span className="ml-auto">Friday &amp; Saturday shaded as the weekend.</span>
      </div>

      {canManage && addingOn && (
        <div className="mt-4 rounded-xl border border-fg/10 bg-void p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-platinum">
              New deadline on{" "}
              {fromDayKey(addingOn)?.toLocaleDateString(undefined, {
                weekday: "long", day: "numeric", month: "long",
              })}
            </p>
            <button
              type="button"
              onClick={() => setAddingOn(null)}
              aria-label="Cancel"
              className="rounded p-1 text-slate hover:bg-fg/10 hover:text-platinum"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            action={createCalendarTaskAction}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* The day comes from the cell that was clicked, so the due date can
                never disagree with where the task renders. */}
            <input type="hidden" name="dueDate" value={addingOn} />

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-slate">What is due</label>
              <input
                name="title"
                required
                maxLength={200}
                placeholder="e.g. Send Q4 creative to 180 Dental"
                className="w-full rounded-lg border border-fg/10 bg-obsidian px-3 py-2 text-sm text-platinum outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate">Project</label>
              <select
                name="projectId"
                required
                defaultValue={defaultProjectId ?? projectFilter !== "ALL" ? projectFilter : ""}
                className="w-full rounded-lg border border-fg/10 bg-obsidian px-3 py-2 text-sm text-platinum outline-none focus:border-cyan"
              >
                <option value="">Choose…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate">Owner</label>
              <select
                name="assigneeId"
                defaultValue=""
                className="w-full rounded-lg border border-fg/10 bg-obsidian px-3 py-2 text-sm text-platinum outline-none focus:border-cyan"
              >
                <option value="">Unassigned</option>
                {directory.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate">Priority</label>
              <select
                name="priority"
                defaultValue={priorities[Math.floor(priorities.length / 2)]?.id ?? priorities[0]?.id}
                className="w-full rounded-lg border border-fg/10 bg-obsidian px-3 py-2 text-sm text-platinum outline-none focus:border-cyan"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="w-full rounded-xl bg-cyan/10 px-4 py-2 text-sm font-bold text-cyan transition-colors hover:bg-cyan hover:text-void"
              >
                Add deadline
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
