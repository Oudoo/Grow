import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, clients } from "@growengine/db";
import { getSession } from "@/lib/auth";

/**
 * /engine entry. Team members land on the console dashboard; client-portal
 * users are routed to their own client portal.
 */
export default async function EngineIndex() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  if (session.clientId) {
    const row = await db
      .select({ slug: clients.slug })
      .from(clients)
      .where(eq(clients.id, session.clientId))
      .limit(1);
    if (row[0]?.slug) redirect(`/engine/client/${row[0].slug}`);
  }
  redirect("/engine/dashboard");
}
