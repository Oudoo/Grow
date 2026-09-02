"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Inbox, Package, LogOut, Moon, Sun, Briefcase, CreditCard, LifeBuoy, BarChart2, Shield, Paintbrush, Gauge, Users, Palette, BookOpen, Building2, Bell, UserRound, Menu, X, SlidersHorizontal, MessagesSquare } from "lucide-react";
import { logoutAction } from "./actions";
import { ChatDock } from "./chat/ChatDock";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { can, type AccessLevel, type AccessMap, type ModuleKey, type UserRole } from "@/lib/access";

type NavLink = {
  name: string;
  href: string;
  icon: typeof Inbox;
  module: ModuleKey;
  need?: AccessLevel;
};

const LINKS: NavLink[] = [
  { name: "Analytics & Reports", href: "/admin/analytics", icon: BarChart2, module: "analytics" },
  { name: "Grow CRM", href: "/admin", icon: Inbox, module: "crm" },
  { name: "Finance Hub", href: "/admin/finance", icon: CreditCard, module: "finance" },
  { name: "Help Desk", href: "/admin/support", icon: LifeBuoy, module: "support" },
  { name: "Content Management", href: "/admin/products", icon: Package, module: "products" },
  { name: "Project Management", href: "/admin/projects", icon: Briefcase, module: "projects" },
  { name: "My Work", href: "/admin/projects/my-work", icon: UserRound, module: "projects" },
  { name: "IAM Portal", href: "/admin/iam", icon: Shield, module: "iam" },
  // Client Access + White-Label write client/tenant config — gate on manage.
  { name: "Client Access", href: "/admin/clients", icon: Building2, module: "iam", need: "manage" },
  { name: "Branding", href: "/admin/branding", icon: Palette, module: "branding" },
  { name: "Grow Playbook", href: "/admin/playbook", icon: BookOpen, module: "playbook" },
  { name: "White-Label", href: "/admin/whitelabel", icon: Paintbrush, module: "branding", need: "manage" },
  { name: "Configuration", href: "/admin/configuration", icon: SlidersHorizontal, module: "settings", need: "manage" },
  { name: "Team Chat", href: "/admin/chat", icon: MessagesSquare, module: "chat" },
];

const SYSTEMS: NavLink[] = [
  { name: "Grow Engine", href: "/engine", icon: Gauge, module: "engine" },
  { name: "Growees Producer", href: "/producer", icon: Users, module: "producer" },
];

export default function AdminShell({
  children,
  role,
  access,
  unread = 0,
}: {
  children: React.ReactNode;
  role: UserRole;
  access: AccessMap;
  /** Unread notification count, for the sidebar bell badge. */
  unread?: number;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Mobile drawer. Closed on every navigation, so tapping a link does not leave
  // the drawer covering the page you just opened.
  const [navOpen, setNavOpen] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setNavOpen(false); }, [pathname]);

  // Hydration guard for theme-dependent rendering.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Hide sidebar on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Only show modules this account can actually open.
  const visibleLinks = LINKS.filter((l) => can(role, access, l.module, l.need ?? "view"));
  const visibleSystems = SYSTEMS.filter((l) => can(role, access, l.module, l.need ?? "view"));

  return (
    <div className="flex h-screen bg-void w-full overflow-hidden absolute inset-0 z-50">
      {/* Scrim — only on mobile, and only while the drawer is open. Tapping it
          closes the drawer, which is the gesture people expect. */}
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/*
        Sidebar. Below lg it is a fixed drawer translated off-screen; from lg up
        it returns to being an ordinary flex child in the row.

        It used to be a plain 256px flex child at every width, which on a 375px
        phone left ~119px for content — the reason the admin was unusable on
        mobile. `shrink-0` keeps it from being squeezed at tablet widths.
      */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-obsidian border-r border-fg/5 flex flex-col
          transition-transform duration-200 ease-out lg:static lg:translate-x-0
          ${navOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close control, mobile only — the scrim alone is not discoverable. */}
        <button
          type="button"
          onClick={() => setNavOpen(false)}
          aria-label="Close navigation"
          className="absolute right-3 top-3 z-20 rounded-lg p-2 text-slate hover:bg-fg/10 hover:text-platinum lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="h-20 flex items-center justify-center px-6 border-b border-fg/5 relative overflow-hidden">
          <Image src="/logo.svg" alt="" width={96} height={96} className="absolute -left-4 -top-4 h-24 w-auto opacity-10 pointer-events-none" />
          <span className="font-heading font-bold text-xl text-platinum relative z-10 text-glow">GROW ADMIN</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {visibleLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  active
                    ? "bg-cyan/10 text-cyan font-bold"
                    : "text-slate hover:bg-fg/5 hover:text-platinum"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {visibleSystems.length > 0 && (
            <div className="pt-5 pb-1 px-4 font-data text-[10px] uppercase tracking-[0.25em] text-slate/70">
              Grow Systems
            </div>
          )}
          {visibleSystems.map((link) => {
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  active
                    ? "bg-cyan/10 text-cyan font-bold"
                    : "text-slate hover:bg-fg/5 hover:text-platinum"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-fg/5 space-y-2">
          {/* Notifications — every account has an inbox, so this is not gated
              on a module: a mention can reach anyone with a Grow account. */}
          <Link
            href="/admin/notifications"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === "/admin/notifications"
                ? "bg-cyan/10 text-cyan font-bold"
                : "text-slate hover:bg-fg/5 hover:text-platinum"
            }`}
          >
            <span className="relative">
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-cyan text-void text-[9px] font-bold min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </span>
            <span>Notifications</span>
          </Link>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl text-slate hover:bg-fg/5 hover:text-platinum transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          )}
          <button
            onClick={() => logoutAction()}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl text-slate hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar — the only way to reach navigation below lg. */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-fg/5 bg-obsidian px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            className="rounded-lg p-2 text-slate hover:bg-fg/10 hover:text-platinum"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading font-bold text-platinum">GROW ADMIN</span>
          <Link
            href="/admin/notifications"
            aria-label="Notifications"
            className="relative ml-auto rounded-lg p-2 text-slate hover:bg-fg/10 hover:text-platinum"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 min-w-[15px] rounded-full bg-cyan px-1 text-[9px] font-bold text-void">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto bg-void">
          {children}
        </main>
      </div>

      {/*
        Floating chat, bottom-right of every console page — except the chat page
        itself, where it would float over the thing it opens.

        Hidden rather than unmounted while the mobile drawer is open: the
        launcher would otherwise sit on top of the drawer, and unmounting would
        throw away an unsent message.
      */}
      {can(role, access, "chat", "view") && pathname !== "/admin/chat" && (
        <ChatDock hidden={navOpen} />
      )}
    </div>
  );
}
