import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db, clients } from "@growengine/db";
import { getSession } from "@/lib/auth";
import { can, PRODUCTS } from "@/lib/access";
import { prisma } from "@/lib/db";
import { Building2 } from "lucide-react";
import { ClientsAccessClient } from "./ClientsAccessClient";

export const dynamic = "force-dynamic";

export default async function ClientsAccessPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, session.access, "iam", "manage")) redirect("/admin");

  let clientRows: { id: string; name: string; slug: string }[] = [];
  try {
    clientRows = await db
      .select({ id: clients.id, name: clients.name, slug: clients.slug })
      .from(clients)
      .orderBy(asc(clients.name));
  } catch {
    /* engine tables may be empty on a fresh DB */
  }

  const accessRows = await prisma.clientAccess.findMany().catch(() => []);
  const accessById = new Map(accessRows.map((a) => [a.clientId, a]));

  const rows = clientRows.map((c) => {
    const a = accessById.get(c.id);
    let tools: string[] = [];
    try {
      tools = a?.tools ? (JSON.parse(a.tools) as string[]) : [];
    } catch {
      tools = [];
    }
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      tools,
      brandName: a?.brandName ?? "",
      logoUrl: a?.logoUrl ?? "",
      primaryColor: a?.primaryColor ?? "",
      accentColor: a?.accentColor ?? "",
      subdomain: a?.subdomain ?? "",
      isActive: a?.isActive ?? true,
    };
  });

  const products = PRODUCTS.map((p) => ({ key: p.key as string, label: p.label }));

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-cyan" />
          Client Access &amp; White-Label
        </h1>
        <p className="text-slate">
          Grant each client the tools they’ve purchased, set their brand, and give them a subdomain
          (<span className="font-data text-slate/80">&lt;subdomain&gt;.growcdx.com</span>). Their users inherit these tools on next login.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-fg/10 rounded-2xl text-slate">
          No clients yet. Clients created in Grow Engine will appear here.
        </div>
      ) : (
        <ClientsAccessClient clients={rows} products={products} />
      )}
    </div>
  );
}
