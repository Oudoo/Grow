"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Hash, Loader2, Lock, MessageSquare, Paperclip, Pencil, Send, SmilePlus, Trash2, X,
} from "lucide-react";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { MentionText } from "@/components/mentions/MentionText";
import type { MentionCandidate } from "@/lib/mentions";
import { REACTIONS } from "@/lib/chat-types";
import { formatBytes } from "@/lib/upload-format";
import {
  channelMessagesAction, deleteMessageAction, editMessageAction,
  markChannelReadAction, postMessageAction, threadRepliesAction,
  toggleReactionAction, type ChatMessageRow, type ThreadReply,
} from "./actions";

/**
 * One channel's conversation: messages, reactions, threads, editing and files.
 *
 * Delivery is polling, not sockets — this runs behind Passenger on shared
 * hosting, which offers no WebSocket path. The interval is declared here rather
 * than hidden in the action so it is obvious and tunable, and it backs off while
 * the tab is hidden so a browser left open all day does not keep hitting the
 * database every few seconds.
 */
const POLL_ACTIVE_MS = 6_000;
const POLL_HIDDEN_MS = 60_000;

export function ChatRoom({
  channelId, channelName, channelSlug, isPrivate, isDm, topic,
  initialMessages, currentUserId, directory, canPost,
}: {
  channelId: string;
  channelName: string;
  channelSlug: string;
  isPrivate: boolean;
  isDm: boolean;
  topic: string | null;
  initialMessages: ChatMessageRow[];
  currentUserId: string;
  directory: MentionCandidate[];
  canPost: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessageRow[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [thread, setThread] = useState<{ parent: ChatMessageRow; replies: ThreadReply[] } | null>(null);
  const [pending, startTransition] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMessages(initialMessages);
    setError(null);
    setEditing(null);
    setThread(null);
  }, [channelId, initialMessages]);

  const refresh = async () => setMessages(await channelMessagesAction(channelId));

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const next = await channelMessagesAction(channelId);
        if (!cancelled) setMessages(next);
      } catch {
        // A failed poll is not worth a banner — the next one usually works, and
        // an error that flickers is worse than a briefly stale view.
      }
      if (!cancelled) timer = setTimeout(tick, document.hidden ? POLL_HIDDEN_MS : POLL_ACTIVE_MS);
    };
    timer = setTimeout(tick, POLL_ACTIVE_MS);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [channelId]);

  useEffect(() => {
    const el = scroller.current;
    // Only auto-scroll when a thread is not open; yanking the main list while
    // someone is reading a thread is disorienting.
    if (el && !thread) el.scrollTop = el.scrollHeight;
  }, [messages, thread]);

  useEffect(() => {
    void markChannelReadAction(channelId).catch(() => {});
  }, [channelId, messages.length]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "That did not work.");
      else await refresh();
    });
  }

  async function openThread(m: ChatMessageRow) {
    setThread({ parent: m, replies: await threadRepliesAction(m.id) });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="mb-3 shrink-0 border-b border-fg/10 pb-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-platinum">
          {isDm ? <MessageSquare className="h-4 w-4 text-slate" />
                : isPrivate ? <Lock className="h-4 w-4 text-slate" />
                : <Hash className="h-4 w-4 text-slate" />}
          {channelName}
        </h2>
        {topic && <p className="mt-0.5 text-sm text-slate">{topic}</p>}
      </header>

      <div ref={scroller} className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate">
            Nothing here yet. Type @ to mention someone and they will be notified.
          </p>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const grouped =
            prev && prev.authorId === m.authorId &&
            new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000;
          const mine = m.authorId === currentUserId;

          return (
            <div key={m.id} className="group">
              {!grouped && (
                <div className="mb-1 flex items-baseline gap-2">
                  <span className={`text-sm font-bold ${mine ? "text-cyan" : "text-platinum"}`}>
                    {m.authorName}
                  </span>
                  <span className="text-[10px] text-slate/70">
                    {new Date(m.createdAt).toLocaleString(undefined, {
                      hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
                    })}
                  </span>
                  {m.editedAt && <span className="text-[10px] text-slate/60">(edited)</span>}
                </div>
              )}

              {editing === m.id ? (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    run(async () => {
                      const r = await editMessageAction(m.id, data);
                      if (r.ok) setEditing(null);
                      return r;
                    });
                  }}
                >
                  <MentionTextarea name="body" rows={2} required directory={directory} defaultValue={m.body} />
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-cyan/10 px-3 py-1 text-xs font-bold text-cyan hover:bg-cyan hover:text-void">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditing(null)} className="text-xs text-slate hover:text-platinum">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {m.body && <MentionText text={m.body} directory={directory} className="text-sm text-platinum" />}

                  {m.attachments.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {m.attachments.map((a) => (
                        <a
                          key={a.id}
                          href={`/api/chat/attachment/${a.id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-fg/10 bg-void px-2.5 py-1.5 text-xs text-cyan hover:border-cyan/40"
                        >
                          <Paperclip className="h-3 w-3 shrink-0" />
                          <span className="max-w-[16rem] truncate">{a.fileName}</span>
                          <span className="text-slate">{formatBytes(a.sizeBytes)}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {m.reactions.map((r) => {
                      const active = r.userIds.includes(currentUserId);
                      return (
                        <button
                          key={r.emoji}
                          onClick={() => run(() => toggleReactionAction(m.id, r.emoji))}
                          title={active ? "Remove your reaction" : "Add your reaction"}
                          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                            active ? "border-cyan/40 bg-cyan/15 text-cyan" : "border-fg/10 bg-void text-slate hover:border-fg/25"
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span className="font-data">{r.userIds.length}</span>
                        </button>
                      );
                    })}

                    {/* Controls appear on hover on a pointer device, and are
                        always present on touch, where hover does not exist. */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                      <button
                        onClick={() => setPickerFor(pickerFor === m.id ? null : m.id)}
                        aria-label="Add reaction"
                        className="rounded p-1 text-slate hover:text-platinum"
                      >
                        <SmilePlus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openThread(m)}
                        aria-label="Reply in thread"
                        className="flex items-center gap-1 rounded p-1 text-slate hover:text-platinum"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {m.replyCount > 0 && <span className="text-[10px]">{m.replyCount}</span>}
                      </button>
                      {mine && (
                        <>
                          <button onClick={() => setEditing(m.id)} aria-label="Edit" className="rounded p-1 text-slate hover:text-platinum">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => run(() => deleteMessageAction(m.id))}
                            aria-label="Delete"
                            className="rounded p-1 text-slate hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {pickerFor === m.id && (
                    <div className="mt-1.5 flex gap-1 rounded-xl border border-fg/15 bg-obsidian p-1.5">
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => { setPickerFor(null); run(() => toggleReactionAction(m.id, emoji)); }}
                          className="rounded px-1.5 py-0.5 text-base hover:bg-fg/10"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.replyCount > 0 && (
                    <button onClick={() => openThread(m)} className="mt-1 text-xs font-semibold text-cyan hover:underline">
                      {m.replyCount} {m.replyCount === 1 ? "reply" : "replies"}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── thread panel ── */}
      {thread && (
        <div className="mt-3 shrink-0 rounded-xl border border-fg/15 bg-void p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Thread</p>
            <button onClick={() => setThread(null)} aria-label="Close thread" className="text-slate hover:text-platinum">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-2 border-l-2 border-fg/20 pl-2 text-xs text-slate">
            <span className="font-bold">{thread.parent.authorName}</span> — {thread.parent.body.slice(0, 140)}
          </p>
          <div className="mb-2 max-h-40 space-y-2 overflow-y-auto">
            {thread.replies.map((r) => (
              <div key={r.id}>
                <span className="text-xs font-bold text-platinum">{r.authorName}</span>
                {r.editedAt && <span className="ml-1 text-[10px] text-slate/60">(edited)</span>}
                <MentionText text={r.body} directory={directory} className="text-sm text-platinum" />
              </div>
            ))}
            {thread.replies.length === 0 && <p className="text-xs text-slate">No replies yet.</p>}
          </div>
          {canPost && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                data.set("parentId", thread.parent.id);
                run(async () => {
                  const r = await postMessageAction(channelId, data);
                  if (r.ok) {
                    form.reset();
                    setThread({ parent: thread.parent, replies: await threadRepliesAction(thread.parent.id) });
                  }
                  return r;
                });
              }}
              className="space-y-2"
            >
              <MentionTextarea name="body" rows={2} required directory={directory} placeholder="Reply in thread…" />
              <button className="rounded-lg bg-cyan/10 px-3 py-1 text-xs font-bold text-cyan hover:bg-cyan hover:text-void">
                Reply
              </button>
            </form>
          )}
        </div>
      )}

      {error && <p className="mt-2 shrink-0 text-xs text-red-400">{error}</p>}

      {canPost ? (
        <form
          className="mt-3 shrink-0 space-y-2 border-t border-fg/10 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            run(async () => {
              const r = await postMessageAction(channelId, data);
              if (r.ok) form.reset();
              return r;
            });
          }}
        >
          <MentionTextarea
            name="body"
            rows={2}
            directory={directory}
            placeholder={`Message ${isDm ? channelName : "#" + channelSlug} — type @ to mention someone`}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate hover:text-platinum">
              <Paperclip className="h-3.5 w-3.5" />
              Attach
              {/* Up to five files, 10 MB each; the server validates type and
                  size again regardless of what the browser allows. */}
              <input type="file" name="files" multiple className="hidden" />
            </label>
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
