import "server-only";

import { prisma } from "@/lib/db";

/**
 * Unread message counts per channel, for one person.
 *
 * Two decisions here are worth knowing:
 *
 *  1. **Membership defines unread.** A count is produced only for a channel you
 *     have actually joined. A public channel you never opened would otherwise
 *     report its entire history as unread, which pins the badge red forever and
 *     says nothing about whether you have anything to read. Those channels are
 *     offered under "Not joined" instead.
 *
 *  2. **One query, not one per channel.** The read marker is per membership, so
 *     the cutoff differs per channel and a single grouped count cannot express
 *     it — the memberships are read first and folded into one OR'd groupBy.
 *     With a channel per client the old shape was a count query each, on every
 *     render of the chat page, and would now also run on every dock poll.
 *
 * Thread replies are excluded, matching what the channel view lists: a badge of
 * three over a conversation with nothing new in it is a bug report waiting to
 * happen. A reply that needs attention travels as a notification instead.
 */
export async function unreadByChannel(userId: string): Promise<Map<string, number>> {
  const memberships = await prisma.channelMember.findMany({
    where: { userId },
    select: { channelId: true, lastReadAt: true },
  });
  // Prisma reads an empty OR as "match nothing", but skipping the round trip
  // entirely is clearer than relying on that.
  if (memberships.length === 0) return new Map();

  const rows = await prisma.chatMessage.groupBy({
    by: ["channelId"],
    where: {
      parentId: null,
      authorId: { not: userId },
      OR: memberships.map((m) => ({
        channelId: m.channelId,
        ...(m.lastReadAt ? { createdAt: { gt: m.lastReadAt } } : {}),
      })),
    },
    _count: { _all: true },
  });

  return new Map(rows.map((r) => [r.channelId, r._count._all]));
}
