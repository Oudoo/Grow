import { getSession } from "@/lib/auth";
import { isDeveloper, type AccessMap, type UserRole } from "@/lib/access";
import { unreadCount } from "@/lib/notify";
import { getDevFlags } from "@growengine/core";
import AdminShell from "./AdminShell";

/**
 * Server layout for the Admin OS. Reads the caller's session so the sidebar can
 * be filtered to the modules they can actually open. The login page renders
 * with no session (middleware allows it) — AdminShell returns children only in
 * that case, so an empty access map here is fine.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = (session?.role ?? "VIEWER") as UserRole;
  const access = (session?.access ?? {}) as AccessMap;
  // Rendered as a badge on the sidebar bell. unreadCount() returns 0 rather
  // than throwing on a database error, so the shell always renders.
  const unread = session ? await unreadCount(session.uid) : 0;
  // Owner-only Developer console link, and the banner it can set for everyone.
  // getDevFlags never throws (defaults on any error), so the shell always renders.
  const developer = isDeveloper(session);
  const banner = session ? (await getDevFlags())["maintenance.banner"] : "";

  return (
    <AdminShell role={role} access={access} unread={unread} developer={developer} banner={banner}>
      {children}
    </AdminShell>
  );
}
