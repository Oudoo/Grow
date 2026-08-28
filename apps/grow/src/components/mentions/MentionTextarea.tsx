"use client";

import { useRef, useState } from "react";
import type { MentionCandidate } from "@/lib/mentions";

/**
 * Textarea with @mention autocomplete.
 *
 * The picker exists so mentions actually resolve: the parser matches against
 * real account names, so a typed "@Mahmud" silently notifies nobody. Choosing
 * from the list guarantees the inserted text is a name the parser will match.
 *
 * Uncontrolled by design — it owns only the autocomplete state and lets the
 * surrounding <form> read the value by name on submit, so it drops into a
 * server-action form with no extra wiring.
 */
export function MentionTextarea({
  name,
  directory,
  placeholder,
  rows = 3,
  defaultValue = "",
  required,
  className = "",
  onBlur,
}: {
  name: string;
  directory: MentionCandidate[];
  placeholder?: string;
  rows?: number;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  onBlur?: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);

  // Candidates for the partial handle currently being typed.
  const matches =
    query === null
      ? []
      : directory
          .filter((u) => {
            const q = query.toLowerCase();
            return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
          })
          .slice(0, 6);

  /**
   * Find an in-progress "@…" immediately before the caret.
   * Allows one space so a full name can be typed ("@Mahmoud Ha|"), but bails on
   * a second space — by then the user has moved on to ordinary prose.
   */
  function detectQuery(el: HTMLTextAreaElement) {
    const upto = el.value.slice(0, el.selectionStart ?? 0);
    const at = upto.lastIndexOf("@");
    if (at === -1) return setQuery(null);

    const before = at === 0 ? "" : upto[at - 1];
    if (before && !/[\s(\[{,;:"']/.test(before)) return setQuery(null);

    const fragment = upto.slice(at + 1);
    if (fragment.includes("\n") || fragment.split(" ").length > 2) return setQuery(null);

    setQuery(fragment);
    setHighlight(0);
  }

  function insert(user: MentionCandidate) {
    const el = ref.current;
    if (!el || query === null) return;

    const caret = el.selectionStart ?? 0;
    const upto = el.value.slice(0, caret);
    const at = upto.lastIndexOf("@");
    if (at === -1) return;

    const next = `${el.value.slice(0, at)}@${user.name} ${el.value.slice(caret)}`;
    el.value = next;
    setQuery(null);

    // Restore the caret just past the inserted name, then return focus so
    // typing continues naturally instead of jumping to the end of the field.
    const pos = at + user.name.length + 2;
    el.focus();
    el.setSelectionRange(pos, pos);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query === null || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insert(matches[highlight]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onInput={(e) => detectQuery(e.currentTarget)}
        onClick={(e) => detectQuery(e.currentTarget)}
        onKeyDown={onKeyDown}
        onBlur={(e) => {
          // Delay so a click on a suggestion registers before the list unmounts.
          const value = e.currentTarget.value;
          setTimeout(() => setQuery(null), 120);
          onBlur?.(value);
        }}
        className={`w-full bg-void border border-fg/10 rounded-lg px-3 py-2 text-sm text-platinum outline-none focus:border-cyan resize-none ${className}`}
      />

      {matches.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 bg-obsidian border border-fg/15 rounded-lg shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {matches.map((u, i) => (
            <li key={u.id}>
              <button
                type="button"
                // onMouseDown fires before the textarea's blur, so the click is
                // not swallowed by the list unmounting.
                onMouseDown={(e) => {
                  e.preventDefault();
                  insert(u);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  i === highlight ? "bg-cyan/15 text-cyan" : "text-platinum hover:bg-fg/5"
                }`}
              >
                <span className="font-semibold">{u.name}</span>
                {u.email && <span className="text-slate ml-2">{u.email}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
