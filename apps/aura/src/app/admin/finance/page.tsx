import { prisma } from "@/lib/db";
import { ClientFinanceManager } from "./ClientFinanceManager";
import type { Invoice } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function FinanceHubPage() {
  let invoices: Invoice[] = [];
  try {
    // Automatically update overdue invoices
    await prisma.invoice.updateMany({
      where: {
        status: { notIn: ["PAID", "OVERDUE"] },
        dueDate: { lt: new Date() }
      },
      data: { status: "OVERDUE" }
    });

    invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Finance DB query failed:", e);
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2">Finance Hub</h1>
          <p className="text-slate">Manage client invoices and track revenue.</p>
        </div>
      </div>

      <ClientFinanceManager initialInvoices={invoices} />
    </div>
  );
}
