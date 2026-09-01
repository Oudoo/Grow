"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/engine/ui/card";
import { Button } from "@/components/engine/ui/button";
import { Input, Label, Select, Textarea } from "@/components/engine/ui/input";
import { ActionForm } from "@/components/engine/action-form";
import { createTask } from "@/app/engine/_actions/work";

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

const WEEK_START = 0; // 0 = Sunday
const WEEKEND = [5, 6]; // Friday, Saturday
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

/** Local calendar date as YYYY-MM-DD — never via toISOString, which shifts to UTC. */
function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The 6×7 grid of days covering a month, including the padding days either side. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - WEEK_START + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  // Six rows always: the height stays constant as you page through months,
  // which stops the layout jumping.
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

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
  const todayKey = ymd(today);

  /** date → items, expanding ranges across every day they cover. */
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    const push = (key: string, item: CalendarItem) => {
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    };
    for (const item of items) {
      if (!item.endDate || item.endDate === item.date) {
        push(item.date, item);
        continue;
      }
      // Walk the range day by day, bounded so a bad end date cannot loop away.
      const start = new Date(`${item.date}T12:00:00`);
      const end = new Date(`${item.endDate}T12:00:00`);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
      for (let d = start, guard = 0; d <= end && guard < 400; guard++) {
        push(ymd(d), item);
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      }
    }
    return map;
  }, [items]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const monthCount = grid.filter(
    (d) => d.getMonth() === cursor.month && (byDay.get(ymd(d))?.length ?? 0) > 0,
  ).length;

  function shift(by: number) {
    setAddingOn(null);
    setCursor((c) => {
      const d = new Date(c.year, c.month + by, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Schedule — {monthLabel}
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
                    WEEKEND.includes(i) ? "text-muted-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((day) => {
                const key = ymd(day);
                const inMonth = day.getMonth() === cursor.month;
                const isToday = key === todayKey;
                const isWeekend = WEEKEND.includes(day.getDay());
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
                        : isWeekend
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
                {new Date(`${addingOn}T12:00:00`).toLocaleDateString(undefined, {
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
