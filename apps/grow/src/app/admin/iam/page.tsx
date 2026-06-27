import { prisma } from "@/lib/db";
import { Shield } from "lucide-react";
import { IamClient } from "./IamClient";
import { MODULES, parseAccess, type AccessMap } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function IamPage() {
  let users: {
    id: string; email: string; name: string; role: string;
    permissions: string | null; access: string | null; clientId: string | null;
    isActive: boolean; createdAt: Date;
  }[] = [];

  try {
    users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  } catch {
    // Table may not exist yet if migrations haven't run on this host
  }

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    access: parseAccess(u.access ?? u.permissions) as AccessMap,
    clientId: u.clientId,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  const modules = MODULES.map((m) => ({ key: m.key as string, label: m.label }));

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-amethyst" />
            IAM Portal
          </h1>
          <p className="text-slate">One account per person — staff and clients. Set each user&apos;s access per module.</p>
        </div>
      </div>

      <IamClient users={rows} modules={modules} />
    </div>
  );
}
