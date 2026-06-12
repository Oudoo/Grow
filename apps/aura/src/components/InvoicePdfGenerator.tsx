"use client";

import { FileText, Download } from "lucide-react";
import { useState } from "react";

interface InvoiceData {
  invoiceNo: string;
  clientName: string;
  amount: number;
  status: string;
  issueDate: string | Date;
  dueDate?: string | Date | null;
}

export function InvoicePdfGenerator({ invoice }: { invoice: InvoiceData }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;
      
      const doc = new jsPDF();
      
      // Colors matching Grow Brand
      const brandColor: [number, number, number] = [2, 132, 199]; // Cyan-600 approx
      const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900

      // Header
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("GROW", 14, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Official Invoice", 160, 25);

      // Invoice Information Section
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Details", 14, 60);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice No: ${invoice.invoiceNo}`, 14, 70);
      doc.text(`Client: ${invoice.clientName}`, 14, 78);
      doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 14, 86);
      if (invoice.dueDate) {
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 14, 94);
      }
      doc.text(`Status: ${invoice.status}`, 14, 102);

      // Table
      autoTable(doc, {
        startY: 120,
        head: [['Description', 'Amount']],
        body: [
          ['Professional Services rendered', `$${invoice.amount.toLocaleString()}`]
        ],
        foot: [['Total', `$${invoice.amount.toLocaleString()}`]],
        headStyles: { fillColor: brandColor },
        footStyles: { fillColor: darkColor },
        theme: 'striped',
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Confidential - Grow | Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`${invoice.invoiceNo}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button 
      onClick={generatePDF}
      disabled={generating}
      title="Download PDF"
      className="p-2 text-slate hover:text-cyan hover:bg-cyan/10 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100"
    >
      {generating ? <Download className="w-4 h-4 animate-pulse" /> : <FileText className="w-4 h-4" />}
    </button>
  );
}
