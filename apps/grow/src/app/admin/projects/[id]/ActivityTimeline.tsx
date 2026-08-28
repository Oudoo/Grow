"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { describeActivity, type ActivityRow } from "@/lib/activity-format";
import { taskActivityAction } from "../actions";

/**
 * Per-task audit trail.
 *
 * Loads on demand when a task panel opens rather than shipping every task's
 * history with the board. Failure renders as an inline message — history is
 * useful context, never a reason to break the panel around it.
 */
export function ActivityTimeline({ taskId }: { taskId: string }) {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setRows(null);
    setFailed(false);

    taskActivityAction(taskId)
      .then((r) => live && setRows(r))
      .catch(() => live && setFailed(true));

    // Guard against a slower earlier request overwriting a newer task's history.
    return () => {
      live = false;
    };
  }, [taskId]);

  return (
    <div className="mt-6 pt-6 border-t border-fg/10">
      <h3 className="font-bold text-sm text-platinum mb-3 flex items-center gap-2">
        <History className="w-4 h-4" /> Activity
      </h3>

      {failed && <p className="text-xs text-slate">Could not load history.</p>}

      {!failed && rows === null && (
        <div className="flex items-center gap-2 text-xs text-slate">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </div>
      )}

      {rows?.length === 0 && <p className="text-xs text-slate">No activity recorded yet.</p>}

      {rows && rows.length > 0 && (
        <ol className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {rows.map((a) => (
            <li key={a.id} className="relative pl-4 text-xs leading-relaxed">
              <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-cyan/60" />
              <span className="text-platinum font-semibold">{a.actorName}</span>{" "}
              <span className="text-slate">{describeActivity(a)}</span>
              <div className="text-[10px] text-slate/70 mt-0.5">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
