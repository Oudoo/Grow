"use server";

import { assertAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveTenantConfigAction(formData: FormData) {
  await assertAuthenticated();

  const data = {
    companyName: (formData.get("companyName") as string).trim() || "Grow",
    tagline: (formData.get("tagline") as string).trim() || null,
    primaryColor: (formData.get("primaryColor") as string) || "#00E5FF",
    secondaryColor: (formData.get("secondaryColor") as string) || "#8B5CF6",
    logoUrl: (formData.get("logoUrl") as string).trim() || null,
    fontHeading: (formData.get("fontHeading") as string).trim() || "Plus Jakarta Sans",
    fontBody: (formData.get("fontBody") as string).trim() || "Inter",
    contactEmail: (formData.get("contactEmail") as string).trim() || null,
    contactPhone: (formData.get("contactPhone") as string).trim() || null,
    address: (formData.get("address") as string).trim() || null,
    isDemo: formData.get("isDemo") === "true",
    updatedAt: new Date(),
  };

  await prisma.tenantConfig.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/admin/whitelabel");
  revalidatePath("/");
}
