import { getSession } from "@/lib/auth";
import type { AccessMap, UserRole } from "@/lib/access";
import { unreadCount } from "@/lib/notify";
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

  return (
    <AdminShell role={role} access={access} unread={unread}>
      {children}
    </AdminShell>
  );
}
