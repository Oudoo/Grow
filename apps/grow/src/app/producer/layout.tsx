import Link from "next/link";

export const metadata = {
  title: "Growees Producer — GROW",
  description:
    "Deterministic recruitment engine — competency-based scoring, multi-rater scorecards, and automated pipeline management.",
};

/**
 * Producer module shell. Renders inside the GROW root layout, but wraps its
 * content in `.producer-scope` so the recruiter tool keeps its dark technical
 * theme without affecting the rest of the app. Access is gated by middleware
 * (same admin session as /admin).
 */
export default function ProducerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="producer-scope">
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ background: "oklch(0.13 0.02 260 / 0.85)", backdropFilter: "blur(12px)", borderColor: "var(--color-border-subtle)" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/producer" className="flex items-center gap-3 group">
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none" aria-label="GROW">
              <g stroke="#6366F1" strokeWidth="5.5" strokeLinecap="square">
                <path d="M 31,5 H 69 L 95,31 V 42 M 95,66 V 69 L 69,95 H 31 L 5,69 V 31 Z" />
                <path d="M 39,25 H 61 L 75,39 V 42 M 75,66 V 61 L 61,75 H 39 L 25,61 V 39 Z" />
                <path d="M 97,46 H 50" /><path d="M 97,54 H 58" /><path d="M 97,62 H 66" />
              </g>
            </svg>
            <div>
              <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                Growees Producer
              </h1>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                GROW · Recruitment Engine
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/producer" className="text-sm px-3 py-1.5 rounded-md transition-colors" style={{ color: "var(--color-text-secondary)" }}>
              Dashboard
            </Link>
            <Link href="/admin" className="text-sm px-3 py-1.5 rounded-md transition-colors" style={{ color: "var(--color-text-secondary)" }}>
              ← Admin
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
