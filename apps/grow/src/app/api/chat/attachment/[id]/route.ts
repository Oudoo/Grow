import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";
import { readUpload, uploadETag } from "@/lib/uploads";

/**
 * Serve a chat attachment.
 *
 * Every request is authorised twice: the caller must have chat access at all,
 * and — for a private channel or a DM — must be a member of the channel the
 * message belongs to. Knowing an attachment id is never sufficient.
 *
 * Content-Disposition is always attachment, never inline. An uploaded SVG or
 * HTML rendered inline would execute in the app's own origin, which is a stored
 * XSS vector; forcing a download removes it without banning useful file types.
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !can(session.role, session.access, "chat", "view")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const attachment = await prisma.chatAttachment.findUnique({
    where: { id },
    select: {
      fileName: true, mimeType: true, sizeBytes: true, storageKey: true,
      message: { select: { channelId: true, channel: { select: { isPrivate: true } } } },
    },
  });
  // Same 404 whether the attachment is missing or forbidden — a different
  // response would confirm that a given id exists.
  if (!attachment) return new Response("Not found", { status: 404 });

  if (attachment.message.channel.isPrivate) {
    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: { channelId: attachment.message.channelId, userId: session.uid },
      },
      select: { id: true },
    });
    if (!member) return new Response("Not found", { status: 404 });
  }

  const etag = uploadETag(attachment.storageKey, attachment.sizeBytes);
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  const bytes = await readUpload(attachment.storageKey);
  if (!bytes) {
    // Row exists, file does not — a restore or a manual deletion. Say so rather
    // than serving an empty body that looks like a corrupt download.
    return new Response("This file is no longer stored on the server.", { status: 410 });
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Length": String(attachment.sizeBytes),
      // Quoted and ASCII-escaped: a filename with a quote or newline could
      // otherwise inject extra header content.
      "Content-Disposition": `attachment; filename="${attachment.fileName.replace(/["\r\n]/g, "")}"`,
      // Private: an attachment is per-viewer authorised and must never be held
      // by a shared cache.
      "Cache-Control": "private, max-age=3600",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
