"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/engine/ui/card";
import { Button } from "@/components/engine/ui/button";
import { Input, Label, Select, Textarea } from "@/components/engine/ui/input";
import { ActionForm } from "@/components/engine/action-form";
import { createTask } from "@/app/engine/_actions/work";
import {
  DAY_LABELS, dayKey, fromDayKey, indexByDay, isWeekend, monthGrid, monthLabel, shiftMonth,
} from "@/lib/calendar";

/**
 * Month calendar for a client's dated commitments, with task creation on a day.
 *
 * Built to answer one question before a date is promised to a client: what is
 * already committed that week? So it shows the three things that carry a real
 * external deadline, not just tasks:
 *
 *   - task due dates
 *   - CAT approval expiry — the client's sign-off clock
 *   - A/B pilot windows, which occupy a range rather than a day
 *
 * The whole month set is passed in and navigation is local, so moving between
 * months is instant and needs no round trip. A client's dated items are few
 * enough that this is cheaper than fetching per month.
 *
 * **Week starts Sunday, and Friday/Saturday are shaded as the weekend.** That is
 * the Egyptian working week, which is where this agency and its clients operate.
 * Change WEEK_START and WEEKEND together if that is ever wrong.
 */

export type CalendarKind = "task" | "approval" | "pilot";

export interface CalendarItem {
  id: string;
  kind: CalendarKind;
  title: string;
  /** YYYY-MM-DD — the day it lands on, or a range's first day. */
  date: string;
  /** YYYY-MM-DD, ranges only (pilots). Inclusive. */
  endDate?: string | null;
  status?: string | null;
  priority?: string | null;
}

const KIND_STYLE: Record<CalendarKind, string> = {
  task: "bg-sky-100 text-sky-900 border-sky-200",
  approval: "bg-amber-100 text-amber-900 border-amber-200",
  pilot: "bg-violet-100 text-violet-900 border-violet-200",
};

const KIND_LABEL: Record<CalendarKind, string> = {
  task: "Task",
  approval: "Client sign-off",
  pilot: "Pilot",
};

export function CreativeCalendar({
  clientId,
  clientName,
  items,
  canManage,
}: {
  clientId: string;
  clientName: string;
  items: CalendarItem[];
  canManage: boolean;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [addingOn, setAddingOn] = useState<string | null>(null);

  const grid = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const todayKey = dayKey(today);

  const byDay = useMemo(() => indexByDay(items), [items]);

  const monthCount = grid.filter(
    (d) => d.getMonth() === cursor.month && (byDay.get(dayKey(d))?.length ?? 0) > 0,
  ).length;

  function shift(by: number) {
    setAddingOn(null);
    setCursor((c) => shiftMonth(c, by));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Schedule — {monthLabel(cursor.year, cursor.month)}
            </CardTitle>
            <CardDescription>
              {monthCount > 0
                ? `${monthCount} day${monthCount === 1 ? "" : "s"} with commitments this month.`
                : "Nothing committed this month."}
              {canManage && " Click a day to add a deadline."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => shift(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAddingOn(null); setCursor({ year: today.getFullYear(), month: today.getMonth() }); }}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => shift(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* min-w keeps the seven columns legible on a phone; the wrapper scrolls
            rather than letting the page scroll sideways. */}
        <div className="overflow-x-auto">
          <div className="min-w-[44rem]">
            <div className="mb-1 grid grid-cols-7 gap-1">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${
                    [5, 6].includes(i) ? "text-muted-foreground/60" : "text-muted-foreground"
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
                const dayItems = byDay.get(key) ?? [];

                return (
                  <div
                    key={key}
                    // `group` so the add affordance can reveal on hover. Weekend
                    // and out-of-month share one background decision rather than
                    // two competing bg- classes, where the later one silently won.
                    className={`group min-h-[5.5rem] rounded-md border p-1.5 transition-colors ${
                      !inMonth
                        ? "bg-muted/30"
                        : weekend
                          ? "bg-muted"
                          : "bg-card"
                    } ${isToday ? "border-primary ring-1 ring-primary" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${
                          inMonth ? (isToday ? "font-bold text-primary" : "text-foreground") : "text-muted-foreground/50"
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
                          // Faint by default so 42 plus signs do not shout, full
                          // on hover or focus. Never opacity-0: on a touch screen
                          // there is no hover, and an invisible control is no
                          // control at all.
                          className={`rounded p-0.5 transition-opacity hover:bg-accent hover:text-foreground focus:opacity-100 group-hover:opacity-100 ${
                            addingOn === key
                              ? "bg-accent text-foreground opacity-100"
                              : "text-muted-foreground opacity-40"
                          }`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="mt-1 space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <div
                          key={`${item.id}-${key}`}
                          title={`${KIND_LABEL[item.kind]}: ${item.title}${item.status ? ` (${item.status})` : ""}`}
                          className={`truncate rounded border px-1 py-0.5 text-[10px] leading-tight ${KIND_STYLE[item.kind]}`}
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <div className="px-1 text-[10px] text-muted-foreground">
                          +{dayItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend — three kinds mean three colours, so say which is which. */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {(Object.keys(KIND_LABEL) as CalendarKind[]).map((kind) => (
            <span key={kind} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${KIND_STYLE[kind]}`} />
              {KIND_LABEL[kind]}
            </span>
          ))}
          <span className="ml-auto">Friday &amp; Saturday shaded as the weekend.</span>
        </div>

        {/* Create-on-a-day. Rendered once below the grid rather than inside a
            cell: a form in a 6rem box is unusable, and this keeps the month
            layout stable while typing. */}
        {canManage && addingOn && (
          <div className="mt-4 rounded-md border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">
                New deadline on{" "}
                {fromDayKey(addingOn)?.toLocaleDateString(undefined, {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </p>
              <button
                type="button"
                onClick={() => setAddingOn(null)}
                aria-label="Cancel"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ActionForm
              action={createTask}
              className="grid gap-3 sm:grid-cols-[1fr_10rem_auto]"
              successMessage={`Added for ${clientName}. It appears on the calendar immediately.`}
              resetOnSuccess
            >
              {/* The day comes from the cell that was clicked, so the date is
                  never typed and cannot disagree with where it renders. */}
              <input type="hidden" name="clientId" value={clientId} />
              <input type="hidden" name="dueDate" value={addingOn} />

              <div>
                <Label htmlFor="cal-title">What is due</Label>
                <Input id="cal-title" name="title" required minLength={2} maxLength={250} placeholder="e.g. Ramadan campaign creative to client" />
              </div>
              <div>
                <Label htmlFor="cal-priority">Priority</Label>
                <Select id="cal-priority" name="priority" defaultValue="medium">
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full sm:w-auto">Add deadline</Button>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="cal-desc">Notes for the team (optional)</Label>
                <Textarea id="cal-desc" name="description" rows={2} maxLength={10000} />
              </div>
            </ActionForm>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
