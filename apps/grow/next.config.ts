import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Self-hosted (Hostinger): skip the built-in image optimizer so we don't
    // depend on optimizer infrastructure. Images are served as-is.
    unoptimized: true,
  },
  // Prevent the CDN from pinning stale HTML for a year. Static pages otherwise
  // receive a long s-maxage, so a deploy wouldn't visibly update until the cache
  // expired. Force short, revalidating caching for everything except Next's
  // content-hashed assets under /_next/ (which are safe to cache immutably).
  async headers() {
    return [
      {
        source: "/((?!_next/).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
