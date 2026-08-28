"use server";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Notification inbox actions.
 *
 * Every write is scoped by `userId: session.uid`, so a caller can only ever
 * mark their own notifications read — the id alone is never enough.
 */

export async function markNotificationReadAction(id: string) {
  const session = await assertAuthenticated();
  await prisma.notification.updateMany({
    where: { id, userId: session.uid, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsReadAction() {
  const session = await assertAuthenticated();
  await prisma.notification.updateMany({
    where: { userId: session.uid, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/admin/notifications");
}
