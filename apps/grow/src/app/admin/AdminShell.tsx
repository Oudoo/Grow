"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Inbox, Package, LogOut, Moon, Sun, Briefcase, CreditCard, LifeBuoy, BarChart2, Shield, Paintbrush, Gauge, Users, Palette, BookOpen, Building2 } from "lucide-react";
import { logoutAction } from "./actions";
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
  { name: "IAM Portal", href: "/admin/iam", icon: Shield, module: "iam" },
  // Client Access + White-Label write client/tenant config — gate on manage.
  { name: "Client Access", href: "/admin/clients", icon: Building2, module: "iam", need: "manage" },
  { name: "Branding", href: "/admin/branding", icon: Palette, module: "branding" },
  { name: "Grow Playbook", href: "/admin/playbook", icon: BookOpen, module: "playbook" },
  { name: "White-Label", href: "/admin/whitelabel", icon: Paintbrush, module: "branding", need: "manage" },
];

const SYSTEMS: NavLink[] = [
  { name: "Grow Engine", href: "/engine", icon: Gauge, module: "engine" },
  { name: "Growees Producer", href: "/producer", icon: Users, module: "producer" },
];

export default function AdminShell({
  children,
  role,
  access,
}: {
  children: React.ReactNode;
  role: UserRole;
  access: AccessMap;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
      {/* Sidebar */}
      <aside className="w-64 bg-obsidian border-r border-fg/5 flex flex-col">
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
      <main className="flex-1 overflow-y-auto bg-void">
        {children}
      </main>
    </div>
  );
}
