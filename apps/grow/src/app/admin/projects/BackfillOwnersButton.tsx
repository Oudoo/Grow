"use client";

import { useState, useTransition } from "react";
import { Link2, Loader2 } from "lucide-react";
import { backfillAssigneesAction } from "./actions";

/**
 * One-time repair for tasks created before owners were IAM accounts.
 *
 * Those tasks carry only a display name, so they never appear in "My Work" and
 * their owner is never notified. This matches each name to an account and links
 * them. Idempotent, so pressing it twice is harmless.
 */
export function BackfillOwnersButton({ count }: { count: number }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ linked: number; unmatched: string[] } | null>(null);

  if (count === 0 && !result) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-2">
        <Link2 className="w-4 h-4" /> Link existing task owners to IAM
      </h3>
      <p className="text-xs text-amber-200/80 mb-3">
        {count} {count === 1 ? "task was" : "tasks were"} created before owners were
        linked to accounts, so {count === 1 ? "it does" : "they do"} not appear in My Work
        and the owner is not notified. This matches each stored name to an account.
      </p>

      <button
        onClick={() =>
          startTransition(async () => setResult(await backfillAssigneesAction()))
        }
        disabled={pending}
        className="bg-amber-400/20 text-amber-200 hover:bg-amber-400 hover:text-void text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {pending && <Loader2 className="w-3 h-3 animate-spin" />}
        {pending ? "Linking…" : "Link owners now"}
      </button>

      {result && (
        <p className="text-xs text-amber-200/90 mt-3">
          Linked {result.linked} {result.linked === 1 ? "task" : "tasks"}.
          {result.unmatched.length > 0 && (
            <> No account matched: {result.unmatched.join(", ")} — reassign these by hand,
            or create the account in the IAM Portal and run this again.</>
          )}
        </p>
      )}
    </div>
  );
}
