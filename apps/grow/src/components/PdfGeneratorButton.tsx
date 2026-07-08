"use client";

import { FileText, Download } from "lucide-react";
import { useState } from "react";
import { buildGrowPdf } from "@/components/pdf/growPdf";

interface LeadData {
  name: string;
  email: string;
  company: string;
  message: string;
  date: string | Date;
  priority?: string;
  dealValue?: number;
  source?: string;
}

const fmt = (d: string | Date) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

export function PdfGeneratorButton({ lead }: { lead: LeadData }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const value = lead.dealValue || 0;
      const p1 = Math.round(value * 0.4);
      const p2 = Math.round(value * 0.35);
      const lineItems = [
        { description: "Phase 1 — Foundation & Measurement", detail: "Tracking rebuild, single source-of-truth dashboard, quick-win audit.", amount: p1 },
        { description: "Phase 2 — Growth Execution", detail: "Creative engine, channel scaling, CRO & retention program.", amount: p2 },
        { description: "Phase 3 — Intelligence & Scale", detail: "Grow Engine analytics, forecasting and always-on optimization.", amount: value - p1 - p2 },
      ];
      const doc = await buildGrowPdf({
        kind: "QUOTATION",
        number: `Q-${new Date(lead.date).getFullYear()}-${String(Math.abs(hash(lead.company)) % 10000).padStart(4, "0")}`,
        date: fmt(lead.date),
        dueLabel: "Valid Until",
        dueValue: fmt(new Date(new Date(lead.date).getTime() + 30 * 86400_000)),
        status: lead.priority ? `${lead.priority} priority` : "Proposed",
        billTo: { name: lead.name, org: lead.company, email: lead.email },
        lineItems: value > 0 ? lineItems : [{ description: "Growth engagement — scope confirmed after discovery", amount: 0 }],
        notes:
          "Scope summary: " +
          (lead.message || "Strategic growth engagement across the Grow ecosystem.") +
          "\nThis quotation is valid for 30 days. Final scope confirmed after discovery.",
      });
      doc.save(`GROW_Quotation_${lead.company.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Failed to generate quotation PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      title="Generate branded quotation PDF"
      className="p-2 rounded-lg text-slate hover:text-cyan hover:bg-cyan/10 transition-colors disabled:opacity-50 flex items-center justify-center"
    >
      {generating ? <Download className="w-4 h-4 animate-pulse" /> : <FileText className="w-4 h-4" />}
    </button>
  );
}
