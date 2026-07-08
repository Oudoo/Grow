"use client";

import { FileText, Download } from "lucide-react";
import { useState } from "react";
import { buildGrowPdf } from "@/components/pdf/growPdf";

interface InvoiceData {
  invoiceNo: string;
  clientName: string;
  amount: number;
  status: string;
  issueDate: string | Date;
  dueDate?: string | Date | null;
}

const fmt = (d: string | Date) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export function InvoicePdfGenerator({ invoice }: { invoice: InvoiceData }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = await buildGrowPdf({
        kind: "INVOICE",
        number: invoice.invoiceNo,
        date: fmt(invoice.issueDate),
        dueLabel: "Due Date",
        dueValue: invoice.dueDate ? fmt(invoice.dueDate) : "On receipt",
        status: invoice.status,
        billTo: { name: invoice.clientName },
        lineItems: [
          {
            description: "Professional services",
            detail: "Growth strategy, execution & reporting for the current period.",
            amount: invoice.amount,
          },
        ],
      });
      doc.save(`GROW_Invoice_${invoice.invoiceNo}_${invoice.clientName.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Failed to generate invoice PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      title="Download branded invoice PDF"
      className="p-2 text-slate hover:text-cyan hover:bg-cyan/10 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100"
    >
      {generating ? <Download className="w-4 h-4 animate-pulse" /> : <FileText className="w-4 h-4" />}
    </button>
  );
}
