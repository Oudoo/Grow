"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Plug, CalendarClock, Ticket, ListChecks,
  Activity, Wallet, Coins, Gauge, Settings, Search, Megaphone, Workflow,
  Lightbulb, BookOpen, ArrowLeft, Menu, X,
} from "lucide-react";
import { SignOutButton } from "@/components/engine/signout";

/**
 * Engine console navigation.
 *
 * Split out of the layout (a server component) because the mobile drawer needs
 * client state. The nav list lives here rather than being passed down: its
 * entries carry icon *components*, which cannot cross the server/client
 * boundary as props.
 *
 * The layout previously rendered a `fixed w-60` sidebar with `ml-60` on the
 * main column at every width, so on a phone the sidebar covered the screen and
 * the content sat 240px off to the right — horizontally scrolled and unusable.
 */

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

export interface ConsoleSidebarProps {
  userLabel: string;
  roleLabel: string;
  tenantSlug: string;
  /** Route back to the hub, or null when this account has no hub modules. */
  backHref: string | null;
  wikiUrl?: string;
}

export function ConsoleSidebar({
  userLabel, roleLabel, tenantSlug, backHref, wikiUrl,
}: ConsoleSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on navigation, so tapping a link does not leave the drawer over the
  // page it just opened.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Mobile top bar — the only route to navigation below lg. */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold tracking-tight">Grow Engine</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{tenantSlug}</span>
      </header>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card
          transition-transform duration-200 ease-out lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b px-4">
          {/* GROW octagonal G mark */}
          <svg width="26" height="26" viewBox="0 0 100 100" fill="none" aria-label="GROW" className="shrink-0">
            <g stroke="#4F46E5" strokeWidth="6" strokeLinecap="square">
              <path d="M 31,5 H 69 L 95,31 V 42 M 95,66 V 69 L 69,95 H 31 L 5,69 V 31 Z" />
              <path d="M 39,25 H 61 L 75,39 V 42 M 75,66 V 61 L 61,75 H 39 L 25,61 V 39 Z" />
              <path d="M 97,46 H 50" /><path d="M 97,54 H 58" /><path d="M 97,62 H 66" />
            </g>
          </svg>
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight tracking-tight">Grow Engine</div>
            <div className="truncate text-[11px] leading-tight text-muted-foreground">{tenantSlug}</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {backHref && (
          <div className="border-b px-2 py-2">
            <Link
              href={backHref}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Grow Admin
            </Link>
          </div>
        )}

        {/* flex-1 + min-h-0 lets this scroll without a hardcoded max-height,
            which previously had to be recalculated whenever the header or the
            back link changed. */}
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          {wikiUrl && (
            <a
              href={wikiUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Knowledge Base
            </a>
          )}
        </nav>

        <div className="shrink-0 border-t p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{userLabel}</div>
              <div className="truncate text-[11px] text-muted-foreground">{roleLabel}</div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
