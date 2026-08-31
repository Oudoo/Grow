"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * A form that actually shows what its server action returned.
 *
 * The engine's actions report problems by returning `{ error: "…" }` — 79 such
 * returns across the module. They were rendered through a `formAction()` helper
 * that was nothing but a type cast:
 *
 *     return action as unknown as (...args: A) => Promise<void>;
 *
 * which discarded the return value entirely. So every validation message,
 * permission refusal and "AI is not configured" went nowhere: the user clicked,
 * something failed, and the screen said nothing. "Generate QBR does nothing" was
 * this, not a missing route.
 *
 * Call shape is deliberately identical to the old one — the action still
 * receives the FormData as its final argument — so `<form action={formAction(x)}>`
 * becomes `<ActionForm action={x}>` with no change to the action itself.
 */

export interface ActionResult {
  ok?: boolean;
  error?: string;
}

export function ActionForm({
  action,
  children,
  className,
  /** Shown briefly on success. Omit for forms where the result is self-evident. */
  successMessage = "Done.",
  /** Reset the fields after a successful submit — right for "add" forms. */
  resetOnSuccess = false,
}: {
  action: (formData: FormData) => Promise<unknown>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
  resetOnSuccess?: boolean;
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setResult(null);
        startTransition(async () => {
          try {
            const returned = (await action(data)) as ActionResult | undefined | void;
            // An action that returns nothing succeeded — most of them redirect
            // or revalidate rather than reporting.
            const next: ActionResult = returned ?? { ok: true };
            setResult(next.error ? { error: next.error } : { ok: true });
            if (!next.error && resetOnSuccess) form.reset();
          } catch (err) {
            // A thrown error is a bug or a permission failure, not a validation
            // message. Show something true rather than a blank screen.
            setResult({
              error: err instanceof Error ? err.message : "Something went wrong. Please try again.",
            });
          }
        });
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>

      {pending && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Working…
        </p>
      )}
      {result?.error && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md border border-red-300 bg-red-50 px-2.5 py-2 text-xs text-red-900">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{result.error}</span>
        </p>
      )}
      {result?.ok && !pending && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> {successMessage}
        </p>
      )}
    </form>
  );
}
