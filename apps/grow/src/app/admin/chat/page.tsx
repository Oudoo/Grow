import Link from "next/link";
import { redirect } from "next/navigation";
import { Hash, Lock, MessagesSquare, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";
import { directoryFor } from "@/lib/directory";
import { ChatRoom } from "./ChatRoom";
import { ActionForm } from "@/components/engine/action-form";
import { channelMessagesAction, createChannelAction, joinChannelAction, visibleChannelIds } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Team chat.
 *
 * Channels, membership and @mentions that notify. Mentions reuse the same parser
 * and notification pipeline as task comments, so being mentioned here reaches
 * you the same way — in-app immediately, with an email copy queued.
 *
 * Deliberately not in this first version: threads, reactions, file uploads,
 * editing and direct messages. Each is a real feature rather than a detail, and
 * a chat that reliably does the basics beats one that half-does six things.
 */
export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, session.access, "chat", "view")) redirect("/admin");

  const canPost = can(session.role, session.access, "chat", "manage");
  const { c: requestedSlug } = await searchParams;

  const visibleIds = await visibleChannelIds(session.uid);
  const [channels, directory] = await Promise.all([
    prisma.channel.findMany({
      where: { id: { in: visibleIds } },
      orderBy: [{ isPrivate: "asc" }, { name: "asc" }],
      select: {
        id: true, slug: true, name: true, topic: true, isPrivate: true,
        members: { where: { userId: session.uid }, select: { lastReadAt: true } },
        _count: { select: { messages: true } },
      },
    }),
    directoryFor("chat", "view"),
  ]);

  // Unread per channel: messages newer than this person's read marker. One
  // grouped query rather than a count per channel.
  const unreadByChannel = new Map<string, number>();
  await Promise.all(
    channels.map(async (ch) => {
      const since = ch.members[0]?.lastReadAt;
      const count = await prisma.chatMessage.count({
        where: {
          channelId: ch.id,
          authorId: { not: session.uid },
          ...(since ? { createdAt: { gt: since } } : {}),
        },
      });
      unreadByChannel.set(ch.id, count);
    }),
  );

  const active =
    channels.find((ch) => ch.slug === requestedSlug) ?? channels[0] ?? null;
  const initialMessages = active ? await channelMessagesAction(active.id) : [];

  // Public channels this person has not joined — offered rather than hidden, so
  // a new starter can find the conversations that already exist.
  const joinable = await prisma.channel.findMany({
    where: { isPrivate: false, members: { none: { userId: session.uid } } },
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2 flex items-center gap-3 font-heading text-3xl font-bold text-platinum">
          <MessagesSquare className="h-8 w-8 text-cyan" />
          Team Chat
        </h1>
        <p className="text-slate">
          Channels for the team. Mention someone with @ and they are notified
          wherever they are.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        {/* ── channel list ── */}
        <aside className="space-y-4">
          <nav className="space-y-1">
            {channels.length === 0 && (
              <p className="text-sm text-slate">No channels yet.</p>
            )}
            {channels.map((ch) => {
              const unread = unreadByChannel.get(ch.id) ?? 0;
              const isActive = active?.id === ch.id;
              return (
                <Link
                  key={ch.id}
                  href={`/admin/chat?c=${ch.slug}`}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-cyan/10 font-bold text-cyan"
                      : "text-slate hover:bg-fg/5 hover:text-platinum"
                  }`}
                >
                  {ch.isPrivate ? <Lock className="h-3.5 w-3.5 shrink-0" /> : <Hash className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{ch.name}</span>
                  {unread > 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-cyan px-1.5 text-[10px] font-bold text-void">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {joinable.length > 0 && (
            <div className="border-t border-fg/10 pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate">Not joined</p>
              <div className="space-y-1">
                {/* .bind, not an arrow: a plain closure created in a server
                    component cannot be serialised to a client component and
                    fails at runtime. A bound server action can. */}
                {joinable.map((ch) => (
                  <ActionForm key={ch.id} action={joinChannelAction.bind(null, ch.id)} successMessage="Joined.">
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate hover:bg-fg/5 hover:text-platinum">
                      <Hash className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{ch.name}</span>
                      <span className="ml-auto text-[10px] text-cyan">Join</span>
                    </button>
                  </ActionForm>
                ))}
              </div>
            </div>
          )}

          {canPost && (
            <div className="border-t border-fg/10 pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate">
                <Plus className="h-3 w-3" /> New channel
              </p>
              <ActionForm action={createChannelAction} className="space-y-2" successMessage="Channel created." resetOnSuccess>
                <input
                  name="name"
                  required
                  maxLength={60}
                  placeholder="e.g. 180 Dental"
                  className="w-full rounded-lg border border-fg/10 bg-void px-3 py-2 text-sm text-platinum outline-none focus:border-cyan"
                />
                <input
                  name="topic"
                  maxLength={140}
                  placeholder="What it's for (optional)"
                  className="w-full rounded-lg border border-fg/10 bg-void px-3 py-2 text-xs text-platinum outline-none focus:border-cyan"
                />
                <label className="flex cursor-pointer items-center gap-2 text-xs text-slate">
                  <input type="checkbox" name="isPrivate" className="h-3.5 w-3.5 accent-cyan" />
                  Private — invitation only
                </label>
                <button className="w-full rounded-lg bg-fg/10 py-1.5 text-xs font-bold text-platinum transition-colors hover:bg-cyan hover:text-void">
                  Create
                </button>
              </ActionForm>
            </div>
          )}
        </aside>

        {/* ── conversation ── */}
        <div className="min-w-0 rounded-2xl border border-fg/10 bg-obsidian p-4 sm:p-5 lg:h-[calc(100vh-16rem)]">
          {active ? (
            <ChatRoom
              channelId={active.id}
              channelName={active.name}
              channelSlug={active.slug}
              isPrivate={active.isPrivate}
              topic={active.topic}
              initialMessages={initialMessages}
              currentUserId={session.uid}
              directory={directory.map((d) => ({ id: d.id, name: d.name, email: d.email }))}
              canPost={canPost}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-slate">
              <MessagesSquare className="mb-3 h-10 w-10 opacity-20" />
              <p>{canPost ? "Create a channel to get started." : "No channels are available to you yet."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
