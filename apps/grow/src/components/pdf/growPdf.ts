/**
 * Branded GROW PDF engine — invoices, quotations and proposals.
 *
 * Draws everything by hand (no jspdf-autotable dependency, whose v5 API break
 * was crashing the old generators), so it is robust and fully on-brand:
 * Electric Indigo #4F46E5, Charcoal Slate ink, clean grid, page footer.
 */

export type GrowDocKind = "INVOICE" | "QUOTATION" | "PROPOSAL";

export interface GrowLineItem {
  description: string;
  detail?: string;
  qty?: number;
  unitPrice?: number;
  amount: number;
}

export interface GrowPdfInput {
  kind: GrowDocKind;
  number: string;
  date: string;
  /** Due date (invoice) or "valid until" (quotation). */
  dueLabel?: string;
  dueValue?: string;
  status?: string;
  billTo: { name: string; org?: string; email?: string };
  lineItems: GrowLineItem[];
  currency?: string; // symbol, default "$"
  taxRate?: number; // percent, e.g. 15 for VAT
  notes?: string;
  /** Company block (issuer). */
  from?: { name: string; tagline?: string; email?: string; site?: string };
}

const INDIGO: [number, number, number] = [79, 70, 229]; // #4F46E5
const INK: [number, number, number] = [26, 32, 44]; // #1A202C
const MUTED: [number, number, number] = [113, 128, 150];
const LINE: [number, number, number] = [226, 232, 240];
const ZEBRA: [number, number, number] = [248, 249, 250];

const KIND_LABEL: Record<GrowDocKind, string> = {
  INVOICE: "Invoice",
  QUOTATION: "Quotation",
  PROPOSAL: "Proposal",
};

export async function buildGrowPdf(input: GrowPdfInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16; // margin
  const cur = input.currency ?? "$";
  const money = (n: number) =>
    `${cur}${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ---- Header band ----
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 34, "F");
  // Brand mark: indigo rounded tile + "G"
  doc.setFillColor(...INDIGO);
  doc.roundedRect(M, 9, 15, 15, 3.5, 3.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("G", M + 7.5, 19.6, { align: "center" });
  // Wordmark
  doc.setFontSize(20);
  doc.text("GROW", M + 20, 19.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 205, 215);
  doc.text((input.from?.tagline ?? "Integrated Creative & Enterprise Infrastructure").toUpperCase(), M + 20, 24.5);
  // Doc kind (right)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(KIND_LABEL[input.kind].toUpperCase(), W - M, 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 205, 215);
  doc.text(`# ${input.number}`, W - M, 24, { align: "right" });

  // ---- Meta row (from / bill-to / dates) ----
  let y = 48;
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FROM", M, y);
  doc.text("BILL TO", W / 2, y);

  doc.setTextColor(...INK);
  doc.setFontSize(10);
  const from = input.from ?? { name: "GROW", email: "hello@growcdx.com", site: "growcdx.com" };
  doc.setFont("helvetica", "bold");
  doc.text(from.name, M, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  let fy = y + 11;
  if (from.email) { doc.text(from.email, M, fy); fy += 4.5; }
  if (from.site) { doc.text(from.site, M, fy); }

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(input.billTo.org || input.billTo.name, W / 2, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  let by = y + 11;
  if (input.billTo.org && input.billTo.name) { doc.text(input.billTo.name, W / 2, by); by += 4.5; }
  if (input.billTo.email) { doc.text(input.billTo.email, W / 2, by); }

  // ---- Dates / status strip ----
  y = 74;
  doc.setDrawColor(...LINE);
  doc.setFillColor(...ZEBRA);
  doc.roundedRect(M, y, W - M * 2, 14, 2, 2, "F");
  const cols: [string, string][] = [
    ["Date", input.date],
    [input.dueLabel ?? "Due", input.dueValue ?? "—"],
    ["Status", input.status ?? "—"],
  ];
  const colW = (W - M * 2) / cols.length;
  cols.forEach(([label, val], i) => {
    const cx = M + colW * i + 6;
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), cx, y + 5.5);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(String(val), cx, y + 11);
  });

  // ---- Line items table (hand-drawn) ----
  y = 98;
  const xDesc = M + 4;
  const xQty = W - M - 78;
  const xUnit = W - M - 52;
  const xAmt = W - M - 4;
  // header
  doc.setFillColor(...INDIGO);
  doc.rect(M, y, W - M * 2, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("DESCRIPTION", xDesc, y + 6);
  doc.text("QTY", xQty, y + 6, { align: "right" });
  doc.text("UNIT", xUnit, y + 6, { align: "right" });
  doc.text("AMOUNT", xAmt, y + 6, { align: "right" });
  y += 9;

  doc.setFont("helvetica", "normal");
  input.lineItems.forEach((li, i) => {
    const hasDetail = !!li.detail;
    const rowH = hasDetail ? 13 : 9;
    if (i % 2 === 1) {
      doc.setFillColor(...ZEBRA);
      doc.rect(M, y, W - M * 2, rowH, "F");
    }
    doc.setTextColor(...INK);
    doc.setFontSize(9.5);
    doc.text(li.description, xDesc, y + 6, { maxWidth: xQty - xDesc - 6 });
    if (hasDetail) {
      doc.setTextColor(...MUTED);
      doc.setFontSize(8);
      doc.text(li.detail!, xDesc, y + 10.5, { maxWidth: xQty - xDesc - 6 });
    }
    doc.setTextColor(...INK);
    doc.setFontSize(9.5);
    if (li.qty != null) doc.text(String(li.qty), xQty, y + 6, { align: "right" });
    if (li.unitPrice != null) doc.text(money(li.unitPrice), xUnit, y + 6, { align: "right" });
    doc.text(money(li.amount), xAmt, y + 6, { align: "right" });
    y += rowH;
    doc.setDrawColor(...LINE);
    doc.line(M, y, W - M, y);
  });

  // ---- Totals ----
  const subtotal = input.lineItems.reduce((s, li) => s + (li.amount || 0), 0);
  const tax = input.taxRate ? subtotal * (input.taxRate / 100) : 0;
  const total = subtotal + tax;
  y += 6;
  const tx = W - M - 4;
  const tlx = W - M - 74;
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", tlx, y, { align: "left" });
  doc.setTextColor(...INK);
  doc.text(money(subtotal), tx, y, { align: "right" });
  if (input.taxRate) {
    y += 6;
    doc.setTextColor(...MUTED);
    doc.text(`VAT (${input.taxRate}%)`, tlx, y, { align: "left" });
    doc.setTextColor(...INK);
    doc.text(money(tax), tx, y, { align: "right" });
  }
  y += 4;
  doc.setDrawColor(...INDIGO);
  doc.setLineWidth(0.6);
  doc.line(tlx, y, tx, y);
  doc.setLineWidth(0.2);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INDIGO);
  doc.text("TOTAL", tlx, y, { align: "left" });
  doc.text(money(total), tx, y, { align: "right" });

  // ---- Notes / terms ----
  y += 16;
  if (y > H - 45) { doc.addPage(); y = M; }
  const note =
    input.notes ??
    (input.kind === "QUOTATION"
      ? "This quotation is valid for 30 days from the date above. Prices are exclusive of any applicable withholding tax."
      : input.kind === "INVOICE"
        ? "Payment due within 14 days. Please reference the invoice number on your transfer."
        : "Prepared by GROW. This proposal is confidential and intended solely for the named recipient.");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(input.kind === "INVOICE" ? "PAYMENT TERMS" : "NOTES", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(doc.splitTextToSize(note, W - M * 2), M, y + 5);

  // ---- Footer ----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.line(M, H - 14, W - M, H - 14);
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text("GROW · growcdx.com · Confidential", M, H - 9);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 9, { align: "right" });
  }

  return doc;
}
