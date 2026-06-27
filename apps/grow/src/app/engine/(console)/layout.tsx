import Link from "next/link";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  LayoutDashboard,
  Users,
  Plug,
  CalendarClock,
  Ticket,
  ListChecks,
  BrainCircuit,
  Activity,
  Wallet,
  Coins,
  Gauge,
  Settings,
  Search,
  Megaphone,
  Workflow,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { db, notifications } from "@growengine/db";
import { requireTeamUser } from "@/lib/engine/session";
import { SignOutButton } from "@/components/engine/signout";

const NAV = [
  { href: "/engine/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/engine/clients", label: "Clients", icon: Users },
  { href: "/engine/integrations", label: "Integration Health", icon: Plug },
  { href: "/engine/meetings", label: "Meetings", icon: CalendarClock },
  { href: "/engine/tickets", label: "Tickets", icon: Ticket },
  { href: "/engine/tasks", label: "Tasks", icon: ListChecks },
  { href: "/engine/aom", label: "Agency Memory", icon: Search },
  { href: "/engine/leads", label: "Lead Audits", icon: Megaphone },
  { href: "/engine/process-intelligence", label: "Process Intelligence", icon: Workflow },
  { href: "/engine/scorecards", label: "Team Scorecards", icon: Gauge },
  { href: "/engine/system", label: "System Health", icon: Activity },
  { href: "/engine/billing", label: "Billing", icon: Wallet },
  { href: "/engine/costs", label: "AI Costs", icon: Coins },
  { href: "/engine/features", label: "Feature Requests", icon: Lightbulb },
  { href: "/engine/settings", label: "Settings", icon: Settings },
];

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeamUser();

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
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 w-60 border-r bg-card">
        <div className="flex h-14 items-center gap-2.5 border-b px-4">
          {/* GROW octagonal G mark */}
          <svg width="26" height="26" viewBox="0 0 100 100" fill="none" aria-label="GROW" className="shrink-0">
            <g stroke="#4F46E5" strokeWidth="6" strokeLinecap="square">
              <path d="M 31,5 H 69 L 95,31 V 42 M 95,66 V 69 L 69,95 H 31 L 5,69 V 31 Z" />
              <path d="M 39,25 H 61 L 75,39 V 42 M 75,66 V 61 L 61,75 H 39 L 25,61 V 39 Z" />
              <path d="M 97,46 H 50" /><path d="M 97,54 H 58" /><path d="M 97,62 H 66" />
            </g>
          </svg>
          <div>
            <div className="text-sm font-bold leading-tight tracking-tight">Grow Engine</div>
            <div className="text-[11px] text-muted-foreground leading-tight">{user.tenantSlug}</div>
          </div>
        </div>
        <nav className="space-y-0.5 p-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 7.5rem)" }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {process.env.WIKIJS_URL && (
            <a
              href={process.env.WIKIJS_URL}
              target="_blank"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </a>
          )}
        </nav>
        <div className="absolute bottom-0 w-full border-t p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user.name ?? user.email}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {user.roleNames.join(", ") || (user.isSuperAdmin ? "Owner" : "Member")}
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="ml-60 flex-1 p-6">
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
