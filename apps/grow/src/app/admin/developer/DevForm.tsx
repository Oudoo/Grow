"use client";

import { useState, useTransition, type ReactNode } from "react";

export interface DevResult {
  ok: boolean;
  message?: string;
  /** Free-form detail (JSON, log lines) rendered in a monospace block. */
  output?: string;
}

/**
 * A form or a bare button that calls a developer action and shows exactly what
 * came back — the console is for seeing, not for guessing. Actions all take a
 * FormData (even the no-input ones) because a server-component closure cannot
 * be handed to a client component (HANDOVER §11.6).
 */
export function DevForm({
  action,
  children,
  submitLabel,
  confirm,
  danger = false,
  className = "",
}: {
  action: (formData: FormData) => Promise<DevResult>;
  children?: ReactNode;
  submitLabel: string;
  /** Ask before running — for anything that changes data. */
  confirm?: string;
  danger?: boolean;
  className?: string;
}) {
  const [result, setResult] = useState<DevResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (confirm && !window.confirm(confirm)) return;
        setResult(null);
        startTransition(async () => {
          try {
            setResult(await action(data));
          } catch (err) {
            setResult({ ok: false, message: err instanceof Error ? err.message : String(err) });
          }
        });
      }}
    >
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
            danger
              ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
              : "bg-cyan/15 text-cyan hover:bg-cyan/25"
          }`}
        >
          {pending ? "Running…" : submitLabel}
        </button>
        {result && (
          <span className={`text-sm ${result.ok ? "text-emerald-300" : "text-red-300"}`}>
            {result.message ?? (result.ok ? "Done." : "Failed.")}
          </span>
        )}
      </div>
      {result?.output && (
        <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-fg/10 bg-void p-3 text-xs leading-5 text-slate whitespace-pre-wrap">
          {result.output}
        </pre>
      )}
    </form>
  );
}
