import "server-only";
import { prisma } from "./db";
import type { AccessMap, ModuleKey } from "./access";

/**
 * Per-client entitlements + white-label branding (hub-side, keyed by engine
 * client id). Admin-granted tools here are inherited by all of that client's
 * CLIENT users at login.
 */

export interface ClientBranding {
  brandName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  subdomain: string | null;
}

export interface ClientAccessData {
  tools: ModuleKey[];
  branding: ClientBranding;
  isActive: boolean;
}

function parseTools(raw: string | null): ModuleKey[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.filter((t): t is ModuleKey => typeof t === "string");
  } catch {
    /* ignore */
  }
  return [];
}

export async function getClientAccess(clientId: string): Promise<ClientAccessData | null> {
  const row = await prisma.clientAccess.findUnique({ where: { clientId } }).catch(() => null);
  if (!row) return null;
  return {
    tools: parseTools(row.tools),
    branding: {
      brandName: row.brandName,
      logoUrl: row.logoUrl,
      primaryColor: row.primaryColor,
      accentColor: row.accentColor,
      subdomain: row.subdomain,
    },
    isActive: row.isActive,
  };
}

/** Look up a client by its white-label subdomain. */
export async function getClientAccessBySubdomain(subdomain: string) {
  const row = await prisma.clientAccess.findUnique({ where: { subdomain } }).catch(() => null);
  if (!row || !row.isActive) return null;
  return { clientId: row.clientId, tools: parseTools(row.tools), branding: {
    brandName: row.brandName, logoUrl: row.logoUrl, primaryColor: row.primaryColor,
    accentColor: row.accentColor, subdomain: row.subdomain,
  } };
}

/** Union a client's entitled tools into a base access map (each ≥ view). */
export function applyClientTools(base: AccessMap, tools: ModuleKey[]): AccessMap {
  const map: AccessMap = { ...base };
  for (const t of tools) {
    if (!map[t] || map[t] === "none") map[t] = "view";
  }
  return map;
}
