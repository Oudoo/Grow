"use client";

import { useState } from "react";
import { BookOpen, Terminal } from "lucide-react";

/**
 * Grow Playbook — staff-only. Renders the self-contained playbook documents in
 * an isolated iframe so their styling/dark-mode never collide with the hub
 * theme. Access is enforced by middleware (playbook module) and the asset route.
 */
const VIEWS = [
  { key: "induction", label: "Executive Induction", icon: BookOpen, src: "/admin/playbook/asset/index.html" },
  { key: "agentos", label: "AgentOS Master Playbook", icon: Terminal, src: "/admin/playbook/asset/agentos_master_playbook.html" },
] as const;

export default function PlaybookPage() {
  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("induction");
  const active = VIEWS.find((v) => v.key === view)!;

  return (
    <div className="flex flex-col h-screen bg-void">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-fg/5 shrink-0">
        <h1 className="font-heading font-bold text-lg text-platinum mr-4">Grow Playbook</h1>
        <div className="flex gap-2">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  view === v.key ? "bg-cyan/10 text-cyan" : "text-slate hover:bg-fg/5 hover:text-platinum"
                }`}
              >
                <Icon className="w-4 h-4" />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>
      <iframe
        key={active.key}
        src={active.src}
        title={active.label}
        className="flex-1 w-full border-0 bg-white"
      />
    </div>
  );
}
