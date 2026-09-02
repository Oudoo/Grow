"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Hash, Loader2, Lock, Maximize2, MessageSquare, MessagesSquare, X } from "lucide-react";
import { ChatRoom } from "./ChatRoom";
import {
  chatDockAction, channelMessagesAction,
  type ChatMessageRow, type DockChannel, type DockState,
} from "./actions";

/**
 * Team chat as a floating dock — one tap from anywhere in the console.
 *
 * Chat has a full page of its own; this exists because most chat is a
 * ten-second interruption in the middle of other work, and navigating away
 * from a half-filled task form to answer "did you send it?" is the reason
 * people go back to WhatsApp instead.
 *
 * Three things it deliberately does not do:
 *
 *  - **It does not reimplement the conversation.** The panel hosts the same
 *    ChatRoom as the full page, so threads, reactions, editing, attachments and
 *    @mentions behave identically and cannot drift apart. Only the header is
 *    suppressed, because the dock's own header already names the channel.
 *  - **It does not poll a conversation nobody opened.** While closed it fetches
 *    a summary — the unread counts, on a slow interval — and nothing else. The
 *    six-second message poll starts when a channel is selected and stops when
 *    the panel closes, because closing unmounts ChatRoom.
 *  - **It does not appear where it would be noise.** Not on the chat page
 *    itself, not for an account without chat access, and not over the mobile
 *    navigation drawer.
 */

/**
 * Unread counts refresh far more slowly than messages inside an open
 * conversation: this runs on every console page, in every tab someone left
 * open, and a badge is not worth a request every six seconds.
 */
const SUMMARY_ACTIVE_MS = 30_000;
const SUMMARY_HIDDEN_MS = 120_000;

/**
 * Stable empty array. ChatRoom re-syncs its state whenever `initialMessages`
 * changes identity, so a fresh `[]` on each render would wipe what it polled.
 */
const NO_MESSAGES: ChatMessageRow[] = [];

function ChannelIcon({ channel, className = "h-3.5 w-3.5" }: { channel: DockChannel; className?: string }) {
  if (channel.isDm) return <MessageSquare className={`${className} shrink-0`} />;
  if (channel.isPrivate) return <Lock className={`${className} shrink-0`} />;
  return <Hash className={`${className} shrink-0`} />;
}

function Badge({ count }: { count: number }) {
  return (
    <span className="shrink-0 rounded-full bg-cyan px-1.5 text-[10px] font-bold leading-4 text-void">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function ChatDock({ hidden = false }: {
  /**
   * Kept mounted but out of sight — used while the mobile navigation drawer is
   * open, where the launcher would sit on top of the drawer. Hiding rather than
   * unmounting preserves an unsent draft.
   */
  hidden?: boolean;
}) {
  const [state, setState] = useState<DockState | null>(null);
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Keyed by channel so a stale response cannot land in the wrong conversation.
  const [initial, setInitial] = useState<{ channelId: string; rows: ChatMessageRow[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    // A failed summary keeps the last good one: a badge that blinks out because
    // one request lost its connection is worse than a count a minute stale.
    try {
      setState(await chatDockAction());
    } catch {
      /* keep the previous summary */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const next = await chatDockAction();
        if (cancelled) return;
        setState(next);
        // No session, or chat withheld from this account. Nothing will change
        // that without a reload, so stop asking — an account that cannot see
        // chat should not be polling for it every thirty seconds, on every page.
        if (next === null) return;
      } catch {
        /* as above — silence is the right response to one failed poll */
      }
      // Backs off while the tab is hidden, so a console left open all day does
      // not keep counting messages nobody is looking at.
      if (!cancelled) timer = setTimeout(tick, document.hidden ? SUMMARY_HIDDEN_MS : SUMMARY_ACTIVE_MS);
    };
    void tick();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const select = useCallback(async (channelId: string) => {
    setActiveId(channelId);
    setListOpen(false);
    setLoading(true);
    try {
      setInitial({ channelId, rows: await channelMessagesAction(channelId) });
    } catch {
      // Show the channel empty rather than nothing at all; ChatRoom's own poll
      // fills it in a few seconds later.
      setInitial({ channelId, rows: NO_MESSAGES });
    } finally {
      setLoading(false);
    }
  }, []);

  // Escape closes — except inside the composer, where it belongs to the mention
  // picker. Losing a half-typed message to a keystroke meant for a dropdown is
  // exactly the kind of small betrayal that stops people using a tool.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      if (listOpen) setListOpen(false);
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, listOpen]);

  // No session, or no chat access: no dock, no error. This renders on every
  // console page, including for the accounts chat is withheld from.
  if (!state) return null;

  const { channels } = state;
  const active = channels.find((c) => c.id === activeId) ?? null;
  const total = channels.reduce((n, c) => n + c.unread, 0);
  // What is waiting somewhere other than the channel you are looking at — the
  // number that justifies opening the switcher.
  const elsewhere = total - (active?.unread ?? 0);

  const rooms = channels.filter((c) => !c.isDm);
  const dms = channels.filter((c) => c.isDm);

  async function openDock() {
    setOpen(true);
    // Land where something is actually waiting, unless a channel is already
    // chosen — reopening the dock should return you to the conversation you
    // were in, not jump you somewhere else.
    const target =
      channels.find((c) => c.id === activeId)?.id ??
      channels.find((c) => c.unread > 0)?.id ??
      channels[0]?.id;
    if (target) await select(target);
  }

  function closeDock() {
    setOpen(false);
    setListOpen(false);
    // Whatever was just read should stop showing as unread immediately, rather
    // than up to thirty seconds later.
    void refresh();
  }

  return (
    <div className={hidden ? "hidden" : undefined}>
      {!open && (
        <button
          type="button"
          onClick={() => void openDock()}
          aria-label={total > 0 ? `Open team chat, ${total} unread` : "Open team chat"}
          title="Team Chat"
          className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-void shadow-lg shadow-black/30 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:bottom-6 sm:right-6"
        >
          <MessagesSquare className="h-6 w-6" />
          {total > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-void px-1 text-[10px] font-bold text-cyan ring-2 ring-cyan">
              {total > 99 ? "99+" : total}
            </span>
          )}
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Team chat"
          /* Phone: a sheet clearing the mobile top bar. From sm up: a panel
             anchored where the launcher was. */
          className="fixed inset-x-3 bottom-3 top-16 z-40 flex flex-col overflow-hidden rounded-2xl border border-fg/10 bg-obsidian shadow-2xl shadow-black/40 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[34rem] sm:max-h-[calc(100vh-3rem)] sm:w-[23rem]"
        >
          <header className="flex shrink-0 items-center gap-1 border-b border-fg/10 px-2.5 py-2">
            <button
              type="button"
              onClick={() => setListOpen((o) => !o)}
              aria-expanded={listOpen}
              aria-label={elsewhere > 0 ? `Switch channel, ${elsewhere} unread elsewhere` : "Switch channel"}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-fg/5"
            >
              {active ? <ChannelIcon channel={active} className="h-4 w-4 text-slate" /> : <MessagesSquare className="h-4 w-4 shrink-0 text-cyan" />}
              <span className="truncate text-sm font-bold text-platinum">{active?.name ?? "Team Chat"}</span>
              <span className="relative shrink-0">
                <ChevronDown className={`h-4 w-4 text-slate transition-transform ${listOpen ? "rotate-180" : ""}`} />
                {/* A dot rather than the number. A count sitting next to the
                    channel name gets read as that channel's unread, when what
                    it means is "waiting in the others" — the browser made that
                    misreading obvious. The numbers live in the list, where each
                    channel owns its own. */}
                {elsewhere > 0 && !listOpen && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan ring-2 ring-obsidian" />
                )}
              </span>
            </button>
            <Link
              href={active ? `/admin/chat?c=${active.slug}` : "/admin/chat"}
              aria-label="Open the full chat page"
              title="Open full view"
              className="rounded-lg p-1.5 text-slate transition-colors hover:bg-fg/10 hover:text-platinum"
            >
              <Maximize2 className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={closeDock}
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-slate transition-colors hover:bg-fg/10 hover:text-platinum"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="relative min-h-0 flex-1">
            <div className="h-full p-3">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-slate" />
                </div>
              ) : active && initial?.channelId === active.id ? (
                <ChatRoom
                  /* Keyed by channel: a switch remounts rather than reconciling,
                     which is what makes passing fresh initial messages safe. */
                  key={active.id}
                  channelId={active.id}
                  channelName={active.name}
                  channelSlug={active.slug}
                  isPrivate={active.isPrivate}
                  isDm={active.isDm}
                  topic={active.topic}
                  initialMessages={initial.rows}
                  currentUserId={state.currentUserId}
                  directory={state.directory}
                  canPost={state.canPost}
                  showHeader={false}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <MessagesSquare className="h-8 w-8 text-slate/20" />
                  <p className="text-sm text-slate">
                    {channels.length === 0 ? "No channels are available to you yet." : "Pick a channel to start."}
                  </p>
                  {channels.length === 0 && state.canPost && (
                    <Link href="/admin/chat" className="text-xs font-bold text-cyan hover:underline">
                      Create one
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Overlaid rather than swapped in, so switching channels — or
                changing your mind about it — never discards a draft. */}
            {listOpen && (
              <nav className="absolute inset-0 z-10 overflow-y-auto bg-obsidian p-2">
                {rooms.length > 0 && (
                  <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate">Channels</p>
                )}
                {rooms.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => void select(ch.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                      ch.id === activeId ? "bg-cyan/10 font-bold text-cyan" : "text-slate hover:bg-fg/5 hover:text-platinum"
                    }`}
                  >
                    <ChannelIcon channel={ch} />
                    <span className="truncate">{ch.name}</span>
                    {ch.unread > 0 && <span className="ml-auto"><Badge count={ch.unread} /></span>}
                  </button>
                ))}

                {dms.length > 0 && (
                  <p className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate">Direct messages</p>
                )}
                {dms.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => void select(ch.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                      ch.id === activeId ? "bg-cyan/10 font-bold text-cyan" : "text-slate hover:bg-fg/5 hover:text-platinum"
                    }`}
                  >
                    <ChannelIcon channel={ch} />
                    <span className="truncate">{ch.name}</span>
                    {ch.unread > 0 && <span className="ml-auto"><Badge count={ch.unread} /></span>}
                  </button>
                ))}

                {/* Joining a channel and starting a DM live on the full page —
                    a 23rem panel is for the conversation, not for administering
                    the list. */}
                <Link
                  href="/admin/chat"
                  className="mt-3 flex items-center gap-2 rounded-lg border border-fg/10 px-2 py-2 text-xs text-slate transition-colors hover:border-cyan/40 hover:text-platinum"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  All channels, DMs and joining
                </Link>
              </nav>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
