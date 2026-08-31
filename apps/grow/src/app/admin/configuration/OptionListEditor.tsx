"use client";

import { useState, useTransition } from "react";
import { GripVertical, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  CONFIG_COLORS, COLOR_BADGE, idFromLabel,
  type ConfigColor,
} from "@/lib/config-types";

/**
 * Editor for a configurable option list (task statuses, priorities, …).
 *
 * Two rules drive the design:
 *
 *  - **Ids are immutable once in use.** The id is the value stored on every
 *    task, so renaming it would orphan them. Existing rows therefore edit their
 *    label only and show the id read-only; new rows derive an id from the label
 *    at the moment they are added, then keep it.
 *  - **In-use options cannot be deleted.** The count comes from the server, and
 *    the delete control is disabled with the reason shown, rather than letting
 *    the save fail after the fact.
 *
 * Order is list order, which is column order on the board (statuses) and
 * urgency, highest first (priorities).
 */

export interface EditableOption {
  id: string;
  label: string;
  color: ConfigColor;
  isComplete?: boolean;
  /** Client-only: set for rows added in this session, whose id is not yet stored. */
  isNew?: boolean;
}

export function OptionListEditor({
  title,
  description,
  initial,
  usage,
  showComplete = false,
  customised,
  onSave,
  onReset,
  addLabel = "Add option",
}: {
  title: string;
  description: string;
  initial: EditableOption[];
  /** id → number of tasks currently holding it. */
  usage: Record<string, number>;
  /** Statuses have a "counts as complete" flag; priorities do not. */
  showComplete?: boolean;
  /** Whether a stored override exists, so "reset to default" is meaningful. */
  customised: boolean;
  onSave: (payload: string) => Promise<{ ok: boolean; error?: string }>;
  onReset: () => Promise<{ ok: boolean; error?: string }>;
  addLabel?: string;
}) {
  const [rows, setRows] = useState<EditableOption[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(rows.map(strip)) !== JSON.stringify(initial.map(strip));

  function strip(o: EditableOption) {
    return showComplete
      ? { id: o.id, label: o.label, color: o.color, isComplete: Boolean(o.isComplete) }
      : { id: o.id, label: o.label, color: o.color };
  }

  function update(i: number, patch: Partial<EditableOption>) {
    setSaved(false);
    setError(null);
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    setSaved(false);
    setRows((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function add() {
    setSaved(false);
    setError(null);
    setRows((prev) => [
      ...prev,
      { id: "", label: "", color: "slate", isComplete: false, isNew: true },
    ]);
  }

  function remove(i: number) {
    setSaved(false);
    setRows((prev) => prev.filter((_, j) => j !== i));
  }

  function save() {
    setError(null);
    setSaved(false);
    // Fill in ids for new rows from their final label, so the admin never has
    // to think about internal identifiers.
    const payload = rows.map((r) => ({ ...strip(r), id: r.id || idFromLabel(r.label) }));
    startTransition(async () => {
      const result = await onSave(JSON.stringify(payload));
      if (result.ok) {
        setSaved(true);
        setRows(payload.map((p) => ({ ...p, color: p.color as ConfigColor })));
      } else {
        setError(result.error ?? "Could not save.");
      }
    });
  }

  function reset() {
    setError(null);
    startTransition(async () => {
      const result = await onReset();
      if (result.ok) window.location.reload();
      else setError(result.error ?? "Could not reset.");
    });
  }

  return (
    <section className="bg-obsidian border border-fg/10 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <h2 className="text-lg font-bold text-platinum">{title}</h2>
        {customised && (
          <button
            onClick={reset}
            disabled={pending}
            className="flex items-center gap-1.5 text-xs text-slate hover:text-platinum disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" /> Reset to default
          </button>
        )}
      </div>
      <p className="text-sm text-slate mb-5">{description}</p>

      <div className="space-y-2">
        {rows.map((row, i) => {
          const inUse = (usage[row.id] ?? 0) > 0;
          return (
            <div
              key={`${row.id}-${i}`}
              className="flex flex-wrap items-center gap-2 bg-void border border-fg/10 rounded-xl p-2.5"
            >
              {/* Reorder. Buttons rather than drag: they work on touch, with a
                  keyboard, and with a screen reader. */}
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="text-slate hover:text-platinum disabled:opacity-25 leading-none text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === rows.length - 1}
                  aria-label="Move down"
                  className="text-slate hover:text-platinum disabled:opacity-25 leading-none text-xs"
                >
                  ▼
                </button>
              </div>
              <GripVertical className="w-4 h-4 text-slate/40 hidden sm:block" />

              <input
                value={row.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Name, e.g. Blocked"
                maxLength={32}
                className="flex-1 min-w-[9rem] bg-transparent text-sm text-platinum outline-none border-b border-transparent focus:border-cyan px-1 py-1"
              />

              <select
                value={row.color}
                onChange={(e) => update(i, { color: e.target.value as ConfigColor })}
                aria-label="Colour"
                className="bg-obsidian border border-fg/10 rounded-lg px-2 py-1.5 text-xs text-platinum outline-none focus:border-cyan"
              >
                {CONFIG_COLORS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${COLOR_BADGE[row.color]}`}>
                {row.label || "preview"}
              </span>

              {showComplete && (
                <label className="flex items-center gap-1.5 text-xs text-slate cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(row.isComplete)}
                    onChange={(e) => update(i, { isComplete: e.target.checked })}
                    className="accent-cyan w-3.5 h-3.5"
                  />
                  Complete
                </label>
              )}

              <span className="text-[10px] text-slate/60 font-data ml-auto">
                {row.isNew && !row.id ? "new" : row.id}
                {inUse && ` · ${usage[row.id]} in use`}
              </span>

              <button
                onClick={() => remove(i)}
                disabled={inUse}
                aria-label={inUse ? "In use — cannot remove" : "Remove"}
                title={inUse ? `${usage[row.id]} task(s) still use this. Move them first.` : "Remove"}
                className="text-slate hover:text-red-400 disabled:opacity-25 disabled:hover:text-slate"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          onClick={add}
          className="flex items-center gap-1.5 text-xs font-bold text-cyan hover:text-platinum"
        >
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
        <button
          onClick={save}
          disabled={pending || !dirty}
          className="ml-auto flex items-center gap-2 bg-cyan/10 text-cyan hover:bg-cyan hover:text-void disabled:opacity-40 disabled:hover:bg-cyan/10 disabled:hover:text-cyan text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="mt-3 text-sm text-green-400">Saved. The change is live everywhere immediately.</p>
      )}
    </section>
  );
}
