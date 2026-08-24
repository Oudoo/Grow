import { getSession } from "@/lib/auth";
import type { AccessMap, UserRole } from "@/lib/access";
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

  return (
    <AdminShell role={role} access={access}>
      {children}
    </AdminShell>
  );
}
