"use server";

import { assertAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { directoryFor } from "@/lib/directory";
import { mentionedUserIds } from "@/lib/mentions";
import { dispatchInBackground, notifyUsers } from "@/lib/notify";

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

  const body = (formData.get("body") as string)?.trim();
  if (!body) return { ok: false, error: "Nothing to send." };
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

  const directory = await directoryFor("chat", "view");
  const mentioned = mentionedUserIds(body, directory);

  await prisma.chatMessage.create({
    data: {
      channelId,
      authorId: actor.uid,
      authorName: actor.name,
      body,
      mentions: mentioned.length ? JSON.stringify(mentioned) : null,
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
  createdAt: Date;
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
    where: { channelId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, authorId: true, authorName: true, body: true, createdAt: true },
  });
  return rows.reverse();
}
