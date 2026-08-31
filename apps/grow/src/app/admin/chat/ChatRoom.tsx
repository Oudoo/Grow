"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Hash, Loader2, Lock, Send } from "lucide-react";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { MentionText } from "@/components/mentions/MentionText";
import type { MentionCandidate } from "@/lib/mentions";
import { channelMessagesAction, markChannelReadAction, postMessageAction, type ChatMessageRow } from "./actions";

/**
 * One channel's conversation.
 *
 * Delivery is polling, not sockets: this runs behind Passenger on shared
 * hosting, which offers no WebSocket path. The interval is declared here rather
 * than hidden in the action so it is obvious and tunable — and it backs off
 * while the tab is hidden, because a browser left open on this page all day
 * should not keep hitting the database every few seconds.
 */
const POLL_ACTIVE_MS = 6_000;
const POLL_HIDDEN_MS = 60_000;

export function ChatRoom({
  channelId,
  channelName,
  channelSlug,
  isPrivate,
  topic,
  initialMessages,
  currentUserId,
  directory,
  canPost,
}: {
  channelId: string;
  channelName: string;
  channelSlug: string;
  isPrivate: boolean;
  topic: string | null;
  initialMessages: ChatMessageRow[];
  currentUserId: string;
  directory: MentionCandidate[];
  canPost: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessageRow[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLFormElement>(null);

  // Reset when switching channels — otherwise the previous conversation shows
  // for a moment under the new channel's name.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMessages(initialMessages);
    setError(null);
  }, [channelId, initialMessages]);

  // Poll for new messages, slowly while the tab is in the background.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const next = await channelMessagesAction(channelId);
        if (!cancelled) setMessages(next);
      } catch {
        // A failed poll is not worth reporting — the next one usually works,
        // and an error banner that flickers is worse than a stale view.
      }
      if (!cancelled) {
        timer = setTimeout(tick, document.hidden ? POLL_HIDDEN_MS : POLL_ACTIVE_MS);
      }
    };

    timer = setTimeout(tick, POLL_ACTIVE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [channelId]);

  // Keep the newest message in view, and clear the unread marker on arrival.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    void markChannelReadAction(channelId).catch(() => {});
  }, [channelId, messages.length]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-fg/10 pb-3 mb-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-platinum">
          {isPrivate ? <Lock className="h-4 w-4 text-slate" /> : <Hash className="h-4 w-4 text-slate" />}
          {channelName}
        </h2>
        {topic && <p className="mt-0.5 text-sm text-slate">{topic}</p>}
      </header>

      <div ref={scroller} className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate">
            Nothing here yet. Say something — type @ to mention someone and they
            will be notified.
          </p>
        )}
        {messages.map((m, i) => {
          // Group consecutive messages from one person: repeating the name on
          // every line makes a fast exchange much harder to read.
          const prev = messages[i - 1];
          const grouped =
            prev &&
            prev.authorId === m.authorId &&
            new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000;
          const mine = m.authorId === currentUserId;

          return (
            <div key={m.id} className={grouped ? "pl-0" : ""}>
              {!grouped && (
                <div className="mb-1 flex items-baseline gap-2">
                  <span className={`text-sm font-bold ${mine ? "text-cyan" : "text-platinum"}`}>
                    {m.authorName}
                  </span>
                  <span className="text-[10px] text-slate/70">
                    {new Date(m.createdAt).toLocaleString(undefined, {
                      hour: "2-digit", minute: "2-digit",
                      day: "numeric", month: "short",
                    })}
                  </span>
                </div>
              )}
              <MentionText text={m.body} directory={directory} className="text-sm text-platinum" />
            </div>
          );
        })}
      </div>

      {canPost ? (
        <form
          ref={composer}
          className="mt-3 shrink-0 space-y-2 border-t border-fg/10 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            setError(null);
            startTransition(async () => {
              const result = await postMessageAction(channelId, data);
              if (result.ok) {
                form.reset();
                setMessages(await channelMessagesAction(channelId));
              } else {
                setError(result.error ?? "Could not send.");
              }
            });
          }}
        >
          <MentionTextarea
            name="body"
            rows={2}
            required
            directory={directory}
            placeholder={`Message #${channelSlug} — type @ to mention someone`}
          />
          <div className="flex items-center gap-3">
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="ml-auto flex items-center gap-2 rounded-xl bg-cyan/10 px-4 py-2 text-xs font-bold text-cyan transition-colors hover:bg-cyan hover:text-void disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {pending ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-3 shrink-0 border-t border-fg/10 pt-3 text-xs text-slate">
          You have read-only access to Team Chat.
        </p>
      )}
    </div>
  );
}
