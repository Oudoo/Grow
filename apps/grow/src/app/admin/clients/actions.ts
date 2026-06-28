"use server";

import { revalidatePath } from "next/cache";
import { assertAccess } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PRODUCTS } from "@/lib/access";

const PRODUCT_KEYS = PRODUCTS.map((p) => p.key);

/** Grant/revoke a client's tools + set white-label branding + subdomain. */
export async function saveClientAccessAction(clientId: string, formData: FormData) {
  await assertAccess("iam", "manage");

  const tools = PRODUCT_KEYS.filter((k) => formData.get(`tool_${k}`) === "on");
  const subdomainRaw = ((formData.get("subdomain") as string) || "").trim().toLowerCase();
  // Subdomains are a single DNS label: letters, digits, hyphens.
  const subdomain = subdomainRaw ? subdomainRaw.replace(/[^a-z0-9-]/g, "").slice(0, 63) || null : null;

  const data = {
    tools: JSON.stringify(tools),
    brandName: ((formData.get("brandName") as string) || "").trim() || null,
    logoUrl: ((formData.get("logoUrl") as string) || "").trim() || null,
    primaryColor: ((formData.get("primaryColor") as string) || "").trim() || null,
    accentColor: ((formData.get("accentColor") as string) || "").trim() || null,
    subdomain,
    isActive: formData.get("isActive") !== "false",
  };

  await prisma.clientAccess.upsert({
    where: { clientId },
    create: { clientId, ...data },
    update: data,
  });

  revalidatePath("/admin/clients");
}
