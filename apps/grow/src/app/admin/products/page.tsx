import { prisma } from "@/lib/db";
import { ClientProductsManager } from "./ClientProductsManager";
import type { EcosystemSuite } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let ecosystem: EcosystemSuite[] = [];
  try {
    ecosystem = await prisma.suite.findMany({
      include: {
        products: true,
      },
    });
  } catch (e) {
    console.error("Products DB query failed:", e);
  }

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2">Content Management</h1>
          <p className="text-slate">Manage the suites, products, and features in the Grow ecosystem.</p>
        </div>
      </div>

      <ClientProductsManager initialEcosystem={ecosystem} />
    </div>
  );
}
