import { prisma } from "@/lib/db";
import { ClientFinanceManager } from "./ClientFinanceManager";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/access";
import type { Invoice } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export default async function FinanceHubPage() {
  let invoices: Invoice[] = [];
  try {
    // Persisting "OVERDUE" is a mutation, so only do it for users who can
    // manage finance — never as a side effect of a read-only visit. Everyone
    // still sees overdue status because we derive it for display below.
    const session = await getSession();
    if (session && can(session.role, session.access, "finance", "manage")) {
      await prisma.invoice.updateMany({
        where: {
          status: { notIn: ["PAID", "OVERDUE"] },
          dueDate: { lt: new Date() },
        },
        data: { status: "OVERDUE" },
      });
    }

    invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Display-time overdue derivation (no write) so view-only users see it too.
    const now = Date.now();
    invoices = invoices.map((inv) =>
      inv.status !== "PAID" && inv.status !== "OVERDUE" && inv.dueDate && inv.dueDate.getTime() < now
        ? { ...inv, status: "OVERDUE" }
        : inv
    );
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
