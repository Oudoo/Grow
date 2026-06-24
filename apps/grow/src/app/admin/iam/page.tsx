import { prisma } from "@/lib/db";
import { Shield } from "lucide-react";
import { IamClient } from "./IamClient";

export const dynamic = "force-dynamic";

const ALL_PERMISSIONS = ["crm", "finance", "products", "projects", "support", "analytics", "iam"] as const;

export default async function IamPage() {
  let users: {
    id: string; email: string; name: string; role: string;
    permissions: string | null; isActive: boolean; createdAt: Date;
  }[] = [];

  try {
    users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  } catch {
    // Table may not exist yet if migrations haven't run on this host
  }

  const rows = users.map((u) => ({
    ...u,
    permissions: u.permissions ? (JSON.parse(u.permissions) as string[]) : [],
  }));

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amethyst" />
            IAM Portal
          </h1>
          <p className="text-slate">Manage admin accounts and their access permissions.</p>
        </div>
      </div>

      <IamClient users={rows} allPermissions={ALL_PERMISSIONS as unknown as string[]} />
    </div>
  );
}
