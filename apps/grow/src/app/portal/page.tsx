import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, clients } from "@growengine/db";
import { getSession } from "@/lib/auth";
import { entitledProducts } from "@/lib/access";
import { ArrowRight, LayoutGrid } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Client portal launcher — a person's branded home showing only the tools they
 * are entitled to. Access to each tool is enforced by the IAM; this page just
 * surfaces what they can open. White-label branding is resolved per client.
 */
export default async function PortalPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const products = entitledProducts(session.role, session.access);

  // Resolve the client (for branding + greeting) when this is a client account.
  let clientName: string | null = null;
  if (session.clientId) {
    const [row] = await db
      .select({ name: clients.name })
      .from(clients)
      .where(eq(clients.id, session.clientId))
      .limit(1);
    clientName = row?.name ?? null;
  }

  return (
    <div className="min-h-screen bg-void text-platinum">
      <header className="border-b border-fg/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-6 h-6 text-cyan" />
            <div>
              <div className="font-heading font-bold text-lg leading-tight">{clientName ?? "GROW"}</div>
              <div className="text-xs text-slate">Your workspace</div>
            </div>
          </div>
          <div className="text-sm text-slate">{session.name || session.email}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-bold mb-2">Welcome{session.name ? `, ${session.name.split(" ")[0]}` : ""}</h1>
        <p className="text-slate mb-10">
          {products.length > 0
            ? "Choose a tool to get started."
            : "You don’t have any tools yet. Your account manager will enable them for you."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <Link
              key={p.key}
              href={p.path}
              className="group rounded-2xl border border-fg/10 bg-obsidian p-6 hover:border-cyan/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading font-bold text-lg text-platinum">{p.label}</span>
                <ArrowRight className="w-5 h-5 text-slate group-hover:text-cyan group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-slate leading-relaxed">{p.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
