import { eq, and, isNull, desc } from "drizzle-orm";
import { db, notifications } from "@growengine/db";
import { requireTeamUser } from "@/lib/engine/session";
import { getSession } from "@/lib/auth";
import { defaultLanding } from "@/lib/access";
import { ConsoleSidebar } from "./ConsoleSidebar";

/**
 * Engine console shell. Navigation lives in ConsoleSidebar (a client component)
 * because the mobile drawer needs state; everything requiring the database or
 * the session stays here.
 */
export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeamUser();

  // Way back to the hub. The engine is reached from the admin sidebar but
  // replaces it entirely, so without this there is no route back to Project
  // Management, CRM or anything else — only the browser's back button.
  //
  // Uses defaultLanding() rather than a hardcoded /admin so it lands on a
  // module this account can actually open, and is null for someone whose only
  // access IS the engine (for them there is nowhere to go back to).
  const hub = await getSession();
  const landing = hub ? defaultLanding(hub.role, hub.access) : null;
  const backHref = landing && !landing.startsWith("/engine") ? landing : null;

  const unread = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.tenantId, user.tenantId),
        eq(notifications.userId, user.id),
        eq(notifications.channel, "in_app"),
        isNull(notifications.readAt)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(5);

  return (
    <div className="min-h-screen">
      <ConsoleSidebar
        userLabel={user.name ?? user.email ?? "Signed in"}
        roleLabel={user.roleNames.join(", ") || (user.isSuperAdmin ? "Owner" : "Member")}
        tenantSlug={user.tenantSlug}
        backHref={backHref}
        wikiUrl={process.env.WIKIJS_URL}
      />

      {/*
        Offsets: `pt-14` clears the mobile top bar, `lg:ml-60` clears the
        sidebar once it stops being a drawer. `min-w-0` is what stops a wide
        table or chart forcing the whole page to scroll sideways — without it a
        flex/grid child refuses to shrink below its content width.
      */}
      <main className="min-w-0 px-4 pb-6 pt-[4.5rem] sm:px-6 lg:ml-60 lg:pt-6">
        {unread.length > 0 && (
          <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-900">
            <strong>{unread.length} new notification{unread.length > 1 ? "s" : ""}:</strong>{" "}
            {unread[0].title}
            {unread.length > 1 ? ` (+${unread.length - 1} more)` : ""}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
