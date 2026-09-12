"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-render a server page on an interval. Used while Maya is in a meeting so
 * the live notes and transcript tail keep up without a manual reload; the
 * data itself is fetched by the server component, not here.
 */
export function AutoRefresh({ intervalMs = 15_000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs]);
  return null;
}
