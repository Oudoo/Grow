"use client";

import { useState } from "react";
import { ExternalLink, RefreshCw, BookOpen } from "lucide-react";

/**
 * Embeds the Living Brand Canvas & Manual (static app served from
 * /branding/ in this same origin): Brand Canvas, Brand Book with the
 * Voice Translator, and the Brand Manual with the Rebrander Engine.
 */
export function BrandingConsole() {
  const [frameKey, setFrameKey] = useState(0);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <div className="font-data text-[10px] uppercase tracking-[0.3em] text-cyan mb-2 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Living Brand System
          </div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-1">Branding</h1>
          <p className="text-slate">
            The Institutional Tech brand canvas, book, and technical manual — including the Voice
            Translator and the Rebrander Engine. Canonical spec lives in BRAND.md.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFrameKey((k) => k + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fg/15 text-sm text-platinum hover:bg-fg/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <a
            href="/admin/branding/asset/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan text-white text-sm font-bold hover:bg-cyan/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Open Full Screen
          </a>
        </div>
      </div>

      <div className="flex-1 min-h-[700px] rounded-2xl overflow-hidden border border-fg/10 bg-void">
        <iframe
          key={frameKey}
          src="/admin/branding/asset/index.html"
          title="GROW Living Brand Canvas"
          className="w-full h-full min-h-[700px] border-0"
        />
      </div>
    </div>
  );
}
