import { createHash } from "node:crypto";

/**
 * Slug for a direct-message channel, derived from its member key.
 *
 * Extracted so it is testable. The original implementation truncated a base64
 * encoding of the key, which meant the slug depended only on the key's first
 * fifteen bytes — entirely inside the first sorted id. Every conversation
 * started by the same person therefore produced the same slug, and the second
 * one violated the unique index.
 */
export function dmKeyFor(a: string, b: string): string {
  return [a, b].sort().join("|");
}

export function dmSlug(dmKey: string): string {
  // A digest of the WHOLE key. 16 hex characters is 64 bits — ample for a
  // per-tenant channel table, and it keeps participant ids out of the URL.
  return `dm-${createHash("sha256").update(dmKey).digest("hex").slice(0, 16)}`;
}
