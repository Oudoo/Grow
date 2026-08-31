"use server";

import { assertAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { directoryFor } from "@/lib/directory";
import { mentionedUserIds } from "@/lib/mentions";
import { dispatchInBackground, notifyUsers } from "@/lib/notify";
import { storeUpload, deleteUpload } from "@/lib/uploads";
import { REACTIONS } from "@/lib/chat-types";

/**
 * Team chat actions.
 *
 * Mentions and notification delivery are not reimplemented here — chat reuses
 * lib/mentions.ts and lib/notify.ts, so an @mention in a channel behaves exactly
 * like one on a task: resolved against real accounts, stored with the message,
 * and delivered in-app immediately with an email copy queued.
 */

const SLUG_MAX = 40;

export interface ChatResult {
  ok: boolean;
  error?: string;
}

/** URL-safe channel name: "Client — 180 Dental" → "client-180-dental". */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}

/** Channels this account can see: public ones, plus private ones they belong to. */
export async function visibleChannelIds(userId: string): Promise<string[]> {
  const [open, mine] = await Promise.all([
    prisma.channel.findMany({ where: { isPrivate: false }, select: { id: true } }),
    prisma.channelMember.findMany({ where: { userId }, select: { channelId: true } }),
  ]);
  return [...new Set([...open.map((c) => c.id), ...mine.map((m) => m.channelId)])];
}

export async function createChannelAction(formData: FormData): Promise<ChatResult> {
  const actor = await assertAccess("chat", "manage");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { ok: false, error: "Give the channel a name." };
  if (name.length > 60) return { ok: false, error: "Channel names are 60 characters at most." };

  const slug = slugify(name);
  if (!slug) return { ok: false, error: "That name has no letters or numbers in it." };

  const existing = await prisma.channel.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: `#${slug} already exists.` };

  const topic = (formData.get("topic") as string)?.trim() || null;
  const isPrivate = formData.get("isPrivate") === "on";

  await prisma.channel.create({
    data: {
      slug, name, topic, isPrivate,
      createdById: actor.uid,
      // The creator joins immediately — a private channel with no members would
      // be invisible to everyone including its author.
      members: { create: { userId: actor.uid, lastReadAt: new Date() } },
    },
  });

  revalidatePath("/admin/chat");
  return { ok: true };
}

/**
 * Join a public channel.
 *
 * Takes the FormData it is called with and ignores it — the channel id is bound
 * at the call site, and a bound server action still receives the form payload as
 * its trailing argument.
 */
export async function joinChannelAction(channelId: string, _formData?: FormData): Promise<ChatResult> {
  const actor = await assertAccess("chat", "view");
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) return { ok: false, error: "That channel no longer exists." };
  // Private channels are joined by invitation, not by knowing the id.
  if (channel.isPrivate) return { ok: false, error: "That channel is private." };

  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId, userId: actor.uid } },
    create: { channelId, userId: actor.uid, lastReadAt: new Date() },
    update: {},
  });
  revalidatePath("/admin/chat");
  return { ok: true };
}

export async function postMessageAction(channelId: string, formData: FormData): Promise<ChatResult> {
  const actor = await assertAccess("chat", "manage");

  const body = (formData.get("body") as string)?.trim() ?? "";
  const hasFiles = formData.getAll("files").some((f) => f instanceof File && f.size > 0);
  // A file on its own is a valid message; empty text with no file is not.
  if (!body && !hasFiles) return { ok: false, error: "Nothing to send." };
  if (body.length > 4000) return { ok: false, error: "That message is too long — 4000 characters maximum." };

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { id: true, slug: true, name: true, isPrivate: true },
  });
  if (!channel) return { ok: false, error: "That channel no longer exists." };

  // Private channels: membership is the authorisation, not merely the view.
  if (channel.isPrivate) {
    const member = await prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId: actor.uid } },
    });
    if (!member) return { ok: false, error: "You are not a member of that channel." };
  }

  // A threaded reply carries its parent; validated so a reply cannot be attached
  // to a message in another channel, and so threads stay one level deep.
  const rawParent = formData.get("parentId");
  let parentId: string | null = null;
  if (typeof rawParent === "string" && rawParent) {
    const parent = await prisma.chatMessage.findUnique({
      where: { id: rawParent },
      select: { channelId: true, parentId: true },
    });
    if (!parent || parent.channelId !== channelId) {
      return { ok: false, error: "That thread no longer exists." };
    }
    // Replying to a reply attaches to the same parent rather than nesting.
    parentId = parent.parentId ?? rawParent;
  }

  // Attachments, stored before the message so a failed upload does not leave a
  // message claiming a file that is not there.
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > 5) return { ok: false, error: "Five files per message is the maximum." };

  const stored = [];
  for (const file of files) {
    const result = await storeUpload(file);
    if (!result.ok || !result.file) {
      // Roll back anything already written — a partial attachment set is worse
      // than a rejected send.
      for (const s of stored) await deleteUpload(s.storageKey);
      return { ok: false, error: result.error ?? "Could not attach that file." };
    }
    stored.push(result.file);
  }

  const directory = await directoryFor("chat", "view");
  const mentioned = mentionedUserIds(body, directory);

  await prisma.chatMessage.create({
    data: {
      channelId,
      authorId: actor.uid,
      authorName: actor.name,
      body,
      parentId,
      mentions: mentioned.length ? JSON.stringify(mentioned) : null,
      attachments: {
        create: stored.map((f) => ({
          fileName: f.fileName,
          mimeType: f.mimeType,
          sizeBytes: f.sizeBytes,
          storageKey: f.storageKey,
          uploadedBy: actor.uid,
        })),
      },
    },
  });

  // Posting counts as reading — otherwise your own message shows as unread.
  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId, userId: actor.uid } },
    create: { channelId, userId: actor.uid, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });

  // Only mentions notify. A notification per channel message would train
  // everyone to ignore notifications within a day.
  if (mentioned.length > 0) {
    await notifyUsers(
      mentioned,
      {
        kind: "mention",
        title: `${actor.name} mentioned you in #${channel.slug}`,
        body: body.slice(0, 600),
        url: `/admin/chat?c=${channel.slug}`,
        actorName: actor.name,
      },
      actor.uid,
    );
    dispatchInBackground();
  }

  revalidatePath("/admin/chat");
  return { ok: true };
}

/** Move this person's read marker to now. */
export async function markChannelReadAction(channelId: string): Promise<void> {
  const actor = await assertAccess("chat", "view");
  await prisma.channelMember.upsert({
    where: { channelId_userId: { channelId, userId: actor.uid } },
    create: { channelId, userId: actor.uid, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });
  revalidatePath("/admin/chat");
}

export interface ChatMessageRow {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  editedAt: Date | null;
  createdAt: Date;
  /** Reply count, so the main view can show "3 replies" without loading them. */
  replyCount: number;
  reactions: { emoji: string; userIds: string[] }[];
  attachments: { id: string; fileName: string; mimeType: string; sizeBytes: number }[];
}

/**
 * Messages for one channel, oldest first.
 *
 * Called by the client on a timer to pick up new messages. Shared hosting behind
 * Passenger has no WebSocket path, so polling is the honest mechanism — the
 * interval lives in the component so it is visible and tunable rather than
 * buried here.
 */
export async function channelMessagesAction(
  channelId: string,
  limit = 100,
): Promise<ChatMessageRow[]> {
  const actor = await assertAccess("chat", "view");

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { isPrivate: true },
  });
  if (!channel) return [];
  if (channel.isPrivate) {
    const member = await prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId: actor.uid } },
    });
    if (!member) return [];
  }

  const rows = await prisma.chatMessage.findMany({
    // Top-level only — replies are loaded per thread when one is opened.
    where: { channelId, parentId: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true, authorId: true, authorName: true, body: true,
      editedAt: true, createdAt: true,
      _count: { select: { replies: true } },
      reactions: { select: { emoji: true, userId: true } },
      attachments: { select: { id: true, fileName: true, mimeType: true, sizeBytes: true } },
    },
  });

  return rows.reverse().map((r) => {
    // Group reactions by emoji, keeping who reacted so the UI can show your own
    // as active and toggle it.
    const byEmoji = new Map<string, string[]>();
    for (const rx of r.reactions) {
      const list = byEmoji.get(rx.emoji) ?? [];
      list.push(rx.userId);
      byEmoji.set(rx.emoji, list);
    }
    return {
      id: r.id,
      authorId: r.authorId,
      authorName: r.authorName,
      body: r.body,
      editedAt: r.editedAt,
      createdAt: r.createdAt,
      replyCount: r._count.replies,
      reactions: [...byEmoji].map(([emoji, userIds]) => ({ emoji, userIds })),
      attachments: r.attachments,
    };
  });
}


// ── Editing ────────────────────────────────────────────────────────────────

/**
 * Edit a message.
 *
 * Only the author, and only the body — reassigning authorship or moving a
 * message between channels are not edits. `editedAt` is stamped so readers can
 * see it changed; quietly rewriting something people have already read is worse
 * than leaving the typo.
 */
export async function editMessageAction(messageId: string, formData: FormData): Promise<ChatResult> {
  const actor = await assertAccess("chat", "manage");

  const body = (formData.get("body") as string)?.trim();
  if (!body) return { ok: false, error: "A message cannot be empty. Delete it instead." };
  if (body.length > 4000) return { ok: false, error: "That message is too long — 4000 characters maximum." };

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { authorId: true, body: true },
  });
  if (!message) return { ok: false, error: "That message no longer exists." };
  if (message.authorId !== actor.uid) return { ok: false, error: "You can only edit your own messages." };
  if (message.body === body) return { ok: true };

  const directory = await directoryFor("chat", "view");
  const mentioned = mentionedUserIds(body, directory);

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      body,
      mentions: mentioned.length ? JSON.stringify(mentioned) : null,
      editedAt: new Date(),
    },
  });

  revalidatePath("/admin/chat");
  return { ok: true };
}

/** Delete a message. Author only; its replies, reactions and files go with it. */
export async function deleteMessageAction(messageId: string): Promise<ChatResult> {
  const actor = await assertAccess("chat", "manage");

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { authorId: true, attachments: { select: { storageKey: true } } },
  });
  if (!message) return { ok: true };
  if (message.authorId !== actor.uid) return { ok: false, error: "You can only delete your own messages." };

  // Remove the files first: the rows cascade away, and an orphaned file on disk
  // would never be reachable again to clean up.
  for (const a of message.attachments) await deleteUpload(a.storageKey);
  await prisma.chatMessage.delete({ where: { id: messageId } });

  revalidatePath("/admin/chat");
  return { ok: true };
}

// ── Reactions ──────────────────────────────────────────────────────────────

/** Toggle one reaction. Adding twice removes it, which is what people expect. */
export async function toggleReactionAction(messageId: string, emoji: string): Promise<ChatResult> {
  const actor = await assertAccess("chat", "manage");
  if (!REACTIONS.includes(emoji as (typeof REACTIONS)[number])) {
    return { ok: false, error: "That reaction is not available." };
  }

  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId: actor.uid, emoji } },
  });

  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } });
  } else {
    // The message may have been deleted between render and click.
    const message = await prisma.chatMessage.findUnique({ where: { id: messageId }, select: { id: true } });
    if (!message) return { ok: false, error: "That message no longer exists." };
    await prisma.messageReaction.create({ data: { messageId, userId: actor.uid, emoji } });
  }

  revalidatePath("/admin/chat");
  return { ok: true };
}

// ── Direct messages ────────────────────────────────────────────────────────

/**
 * Open (or reopen) a direct conversation with one person.
 *
 * A DM is a Channel with isDm set, so threads, reactions, attachments, mentions
 * and read state all work without a parallel implementation. `dmKey` is the two
 * member ids sorted and joined, which makes "the conversation with this person"
 * a single unique lookup rather than a scan.
 */
export async function openDmAction(otherUserId: string): Promise<ChatResult & { slug?: string }> {
  const actor = await assertAccess("chat", "manage");
  if (otherUserId === actor.uid) return { ok: false, error: "You cannot message yourself." };

  const directory = await directoryFor("chat", "view");
  const other = directory.find((u) => u.id === otherUserId);
  if (!other) return { ok: false, error: "That person does not have chat access." };

  const dmKey = [actor.uid, otherUserId].sort().join("|");
  const existing = await prisma.channel.findUnique({ where: { dmKey }, select: { slug: true } });
  if (existing) return { ok: true, slug: existing.slug };

  // Slug is derived from the key's hash, not from names: names change, and a
  // slug containing two people's names leaks who talks to whom in a URL.
  const slug = `dm-${Buffer.from(dmKey).toString("base64url").slice(0, 20).toLowerCase()}`;

  await prisma.channel.create({
    data: {
      slug,
      // Display name is resolved from members at render time; this is a fallback.
      name: other.name,
      isPrivate: true,
      isDm: true,
      dmKey,
      createdById: actor.uid,
      members: {
        create: [
          { userId: actor.uid, lastReadAt: new Date() },
          { userId: otherUserId },
        ],
      },
    },
  });

  revalidatePath("/admin/chat");
  return { ok: true, slug };
}

// ── Threads ────────────────────────────────────────────────────────────────

export interface ThreadReply {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  editedAt: Date | null;
  createdAt: Date;
}

/** Replies to one message, oldest first. */
export async function threadRepliesAction(parentId: string): Promise<ThreadReply[]> {
  const actor = await assertAccess("chat", "view");

  const parent = await prisma.chatMessage.findUnique({
    where: { id: parentId },
    select: { channel: { select: { id: true, isPrivate: true } } },
  });
  if (!parent) return [];
  if (parent.channel.isPrivate) {
    const member = await prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId: parent.channel.id, userId: actor.uid } },
    });
    if (!member) return [];
  }

  return prisma.chatMessage.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    select: { id: true, authorId: true, authorName: true, body: true, editedAt: true, createdAt: true },
  });
}
