"use client";

import { useState } from "react";
import { ExternalLink, RefreshCw, Activity, ShieldCheck, AlertTriangle } from "lucide-react";

export interface SystemStatus {
  healthy: boolean | null; // null = unknown / unreachable
  detail: string;
}

export function SystemConsole({
  name,
  tagline,
  url,
  status,
  capabilities,
}: {
  name: string;
  tagline: string;
  url: string;
  status: SystemStatus;
  capabilities: string[];
}) {
  const [frameKey, setFrameKey] = useState(0);

  const badge =
    status.healthy === true
      ? { label: "OPERATIONAL", cls: "bg-green-500/10 text-green-500 border-green-500/30", Icon: ShieldCheck }
      : status.healthy === false
        ? { label: "DEGRADED", cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", Icon: AlertTriangle }
        : { label: "UNREACHABLE", cls: "bg-red-500/10 text-red-500 border-red-500/30", Icon: AlertTriangle };

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <div className="font-data text-[10px] uppercase tracking-[0.3em] text-cyan mb-2">Grow Systems</div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-1">{name}</h1>
          <p className="text-slate">{tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-data text-xs ${badge.cls}`}>
            <badge.Icon className="w-3.5 h-3.5" />
            {badge.label}
          </span>
          <button
            onClick={() => setFrameKey((k) => k + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fg/15 text-sm text-platinum hover:bg-fg/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan text-white text-sm font-bold hover:bg-cyan/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Open Full App
          </a>
        </div>
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="surface p-4">
          <div className="font-data text-[10px] uppercase tracking-widest text-slate mb-1 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Endpoint
          </div>
          <div className="font-data text-sm text-platinum break-all">{url}</div>
        </div>
        <div className="surface p-4">
          <div className="font-data text-[10px] uppercase tracking-widest text-slate mb-1">System Report</div>
          <div className="text-sm text-platinum">{status.detail}</div>
        </div>
        <div className="surface p-4">
          <div className="font-data text-[10px] uppercase tracking-widest text-slate mb-1">Capabilities</div>
          <div className="text-xs text-slate leading-relaxed">{capabilities.join(" · ")}</div>
        </div>
      </div>

      {/* Embedded console */}
      <div className="flex-1 min-h-[640px] rounded-2xl overflow-hidden border border-fg/10 bg-void relative">
        {status.healthy === null ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 gap-3">
            <AlertTriangle className="w-10 h-10 text-red-500" />
            <h3 className="text-xl font-heading font-bold text-platinum">Service Unreachable</h3>
            <p className="text-slate max-w-md text-sm">
              {name} is not responding at <span className="font-data">{url}</span>. Start the service, then
              reload this console. The endpoint is configured via environment variables in the Grow hub.
            </p>
          </div>
        ) : (
          <iframe
            key={frameKey}
            src={url}
            title={name}
            className="w-full h-full min-h-[640px] border-0"
          />
        )}
      </div>
    </div>
  );
}
