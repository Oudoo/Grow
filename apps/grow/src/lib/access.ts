/**
 * Unified access model for the whole Grow app.
 *
 * Every human — internal staff and external clients — is one IAM user
 * (`AdminUser`). Access is granted per module at one of three levels:
 *   none   — cannot open the module
 *   view   — read-only
 *   manage — full read/write
 *
 * SUPER_ADMIN implicitly has `manage` everywhere. CLIENT users are scoped to
 * a single engine client (see AdminUser.clientId) and typically only get
 * `view` on the engine portal.
 */

export type AccessLevel = "none" | "view" | "manage";

export type ModuleKey =
  | "crm"
  | "finance"
  | "products"
  | "projects"
  | "support"
  | "analytics"
  | "iam"
  | "branding"
  | "playbook"
  | "producer"
  | "engine"
  | "chatbot";

export type AccessMap = Partial<Record<ModuleKey, AccessLevel>>;

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MEMBER" | "VIEWER" | "CLIENT";

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  /** Route prefix used to gate access in middleware. */
  path: string;
}

/** Canonical module list — drives the IAM portal and route gating. */
export const MODULES: ModuleDef[] = [
  { key: "analytics", label: "Analytics & Reports", path: "/admin/analytics" },
  { key: "crm", label: "Grow CRM", path: "/admin" },
  { key: "finance", label: "Finance Hub", path: "/admin/finance" },
  { key: "support", label: "Help Desk", path: "/admin/support" },
  { key: "products", label: "Content Management", path: "/admin/products" },
  { key: "projects", label: "Project Management", path: "/admin/projects" },
  { key: "iam", label: "IAM Portal", path: "/admin/iam" },
  { key: "branding", label: "Branding", path: "/admin/branding" },
  { key: "playbook", label: "Grow Playbook", path: "/admin/playbook" },
  { key: "engine", label: "Grow Engine", path: "/engine" },
  { key: "producer", label: "Growees Producer", path: "/producer" },
];

export const MODULE_KEYS = MODULES.map((m) => m.key);

/**
 * Launchable products (standalone tools a client can be entitled to), as shown
 * on the client portal dashboard. Distinct from internal admin sub-modules
 * (crm/finance/…). A user sees a product card only if they have ≥view on it.
 */
export interface ProductDef {
  key: ModuleKey;
  label: string;
  path: string;
  description: string;
}

export const PRODUCTS: ProductDef[] = [
  { key: "engine", label: "Grow Engine", path: "/engine", description: "Live KPIs, intelligence, approvals, reports and your agency memory." },
  { key: "producer", label: "Growees Producer", path: "/producer", description: "AI-assisted recruitment — vacancies, candidates and scorecards." },
  // "chatbot" is intentionally omitted until the /chatbot route exists — a
  // launcher card for it would 404. The ModuleKey stays defined so entitlements
  // and IAM can reference it; re-add the product here when it ships.
];

/** Products this user may open (≥view), in canonical order. */
export function entitledProducts(role: UserRole, map: AccessMap | null | undefined): ProductDef[] {
  return PRODUCTS.filter((p) => can(role, map, p.key, "view"));
}

const LEVEL_RANK: Record<AccessLevel, number> = { none: 0, view: 1, manage: 2 };

/** True when `have` meets or exceeds `need`. */
export function levelMeets(have: AccessLevel | undefined, need: AccessLevel): boolean {
  return LEVEL_RANK[have ?? "none"] >= LEVEL_RANK[need];
}

/**
 * Effective access for a user. SUPER_ADMIN gets `manage` everywhere; everyone
 * else uses their stored map. Returns the level for one module.
 */
export function accessLevel(role: UserRole, map: AccessMap | null | undefined, module: ModuleKey): AccessLevel {
  if (role === "SUPER_ADMIN") return "manage";
  return map?.[module] ?? "none";
}

/** Permission check: does this user have at least `need` on `module`? */
export function can(
  role: UserRole,
  map: AccessMap | null | undefined,
  module: ModuleKey,
  need: AccessLevel = "view"
): boolean {
  return levelMeets(accessLevel(role, map, module), need);
}

/** Parse the stored JSON access map defensively (back-compat with legacy data). */
export function parseAccess(raw: string | null | undefined): AccessMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    // Legacy shape: ["crm","finance",…] (on/off) → treat each as "manage".
    if (Array.isArray(parsed)) {
      const map: AccessMap = {};
      for (const k of parsed) if (typeof k === "string") map[k as ModuleKey] = "manage";
      return map;
    }
    const map: AccessMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (v === "view" || v === "manage" || v === "none") map[k as ModuleKey] = v;
    }
    return map;
  } catch {
    return {};
  }
}

/** First module (by canonical order) the user may open — used for post-login landing. */
export function defaultLanding(role: UserRole, map: AccessMap | null | undefined): string {
  // Clients land on their tool launcher; staff land on their first admin module.
  if (role === "CLIENT") return "/portal";
  for (const m of MODULES) {
    if (can(role, map, m.key, "view")) return m.path;
  }
  return "/portal";
}

const RESERVED_SUBDOMAINS = new Set([
  "www", "app", "api", "mail", "admin", "portal", "ftp", "cpanel", "webmail",
  "ns1", "ns2", "static", "cdn", "blog", "smtp", "imap", "dev", "staging",
]);

const ROOT_DOMAIN = "growcdx.com";

/**
 * Extract a client's white-label subdomain label from a Host header, or null.
 * `acme.growcdx.com` → "acme"; the apex, www, reserved labels, multi-level
 * hosts and localhost all → null. Pure/edge-safe (no DB).
 */
export function clientSubdomain(host: string | null | undefined): string | null {
  if (!host) return null;
  const h = host.split(":")[0].toLowerCase().trim();
  if (!h.endsWith("." + ROOT_DOMAIN)) return null;
  const label = h.slice(0, -(ROOT_DOMAIN.length + 1));
  if (!label || label.includes(".")) return null; // only single-label subdomains
  if (RESERVED_SUBDOMAINS.has(label)) return null;
  return label;
}

/** Which module a request path belongs to (longest-prefix match), or null if public. */
export function moduleForPath(pathname: string): ModuleKey | null {
  let match: ModuleDef | null = null;
  for (const m of MODULES) {
    // "/admin" (crm) is the catch-all for the admin shell; prefer more specific paths.
    if (pathname === m.path || pathname.startsWith(m.path + "/")) {
      if (!match || m.path.length > match.path.length) match = m;
    }
  }
  if (match) return match.key;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "crm";
  if (pathname.startsWith("/producer")) return "producer";
  if (pathname.startsWith("/engine")) return "engine";
  return null;
}
