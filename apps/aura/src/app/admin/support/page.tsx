import { prisma } from "@/lib/db";
import { ClientSupportManager } from "./ClientSupportManager";
import type { Ticket } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function SupportHubPage() {
  let tickets: Ticket[] = [];
  try {
    tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Support DB query failed:", e);
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2">Help Desk</h1>
          <p className="text-slate">Manage client support tickets and maintenance requests.</p>
        </div>
      </div>

      <ClientSupportManager initialTickets={tickets} />
    </div>
  );
}
