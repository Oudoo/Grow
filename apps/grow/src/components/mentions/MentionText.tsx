"use client";

import { segmentMentions, type MentionCandidate } from "@/lib/mentions";

/**
 * Render user-authored text with @mentions highlighted.
 *
 * Uses the same parser as the notification path, so what is highlighted is
 * exactly what triggered an email — a mention that renders plain is a mention
 * that notified nobody, which is the correct and honest signal.
 *
 * Text is rendered as React children (never dangerouslySetInnerHTML), so
 * comment content cannot inject markup.
 */
export function MentionText({
  text,
  directory,
  className = "",
}: {
  text: string;
  directory: MentionCandidate[];
  className?: string;
}) {
  const segments = segmentMentions(text, directory);
  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {segments.map((seg, i) =>
        seg.type === "mention" ? (
          <span
            key={i}
            className="bg-cyan/15 text-cyan font-semibold rounded px-1 py-0.5"
          >
            {seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </p>
  );
}
