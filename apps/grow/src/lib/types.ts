// Shared input types for admin server actions and client managers.

/**
 * Shape consumed by the public navbar/product pages and the admin content
 * manager. The Prisma-only fields are optional so both the database result
 * (`Suite & { products: Product[] }`) and the static fallback in
 * `src/data/ecosystem.ts` satisfy this type.
 */
export interface EcosystemProduct {
  id?: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descAr: string;
  status?: string;
  order?: number;
  features?: string | null;
  suiteId?: string;
}

export interface EcosystemSuite {
  id?: string;
  suite: string;
  suiteAr: string;
  slug: string;
  /** "creative" = marketing/agency solutions, "tech" = enterprise systems.
   *  Typed as string so the Prisma row (category: string) is assignable; the
   *  navbar falls back to a known creative-slug set when absent/unknown. */
  category?: string;
  products: EcosystemProduct[];
}

export interface ProductInput {
  name: string;
  nameAr?: string;
  slug: string;
  description: string;
  descAr?: string;
  order?: string | number;
  features?: string | null;
}

export interface SuiteInput {
  suite: string;
  suiteAr?: string;
  slug: string;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface AnalyticsData {
  financials: {
    pipelineValue: number;
    revenueCollected: number;
    revenueAtRisk: number;
  };
  leadSources: NamedValue[];
  operations: {
    completedTasks: number;
    pendingTasks: number;
  };
  support: {
    openTickets: number;
    resolvedTickets: number;
    ticketPriorities: NamedValue[];
  };
}
