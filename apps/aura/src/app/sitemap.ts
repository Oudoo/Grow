import type { MetadataRoute } from "next";
import { ecosystem } from "@/data/ecosystem";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grow.agency";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/methodology",
    "/suites",
    "/products",
    "/support",
    "/audit",
    "/audit-quiz",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  // Product detail pages, sourced from bundled data (no DB dependency at build).
  const productRoutes = ecosystem
    .flatMap((suite) => suite.products)
    .map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...productRoutes];
}
