import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/data/portfolio";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  return cs
    ? { title: `${cs.client} — Case Study | GROW`, description: cs.summary }
    : { title: "Case Study | GROW" };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  const index = caseStudies.findIndex((c) => c.slug === cs.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Hero */}
      <section className="w-full py-16 bg-void border-b border-fg/5 relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-slate hover:text-platinum transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> All case studies
          </Link>
          <div className="flex items-center gap-3 flex-wrap mb-5">
            <span className="font-data text-[11px] uppercase tracking-wider text-cyan px-3 py-1 rounded-full bg-cyan/10">{cs.sector}</span>
            <span className="font-data text-[11px] text-slate">{cs.region}</span>
            <span className="font-data text-[11px] text-slate">· {cs.year}</span>
            <span className="font-data text-[11px] text-slate">· {cs.duration}</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-platinum leading-tight mb-5">{cs.title}</h1>
          <p className="text-lg text-slate leading-relaxed max-w-3xl">{cs.summary}</p>

          <div className="flex flex-wrap gap-2 mt-7">
            {cs.services.map((s) => (
              <span key={s} className="text-xs text-slate px-3 py-1.5 rounded-full border border-fg/10 bg-obsidian">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="w-full py-14 bg-void border-b border-fg/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cs.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-fg/10 bg-obsidian px-5 py-6 text-center">
                <div className="font-heading text-3xl md:text-4xl font-bold text-cyan">{m.value}</div>
                <div className="text-xs text-slate leading-snug mt-2">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge + Approach */}
      <section className="w-full py-16 bg-void">
        <div className="container mx-auto px-4 max-w-4xl space-y-14">
          <div>
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-4">The Challenge</div>
            <p className="text-slate text-lg leading-relaxed">{cs.challenge}</p>
          </div>

          <div>
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-6">What We Did</div>
            <ol className="space-y-5">
              {cs.approach.map((step, i) => (
                <li key={i} className="flex gap-5 rounded-2xl border border-fg/10 bg-obsidian p-6">
                  <span className="font-data text-cyan font-bold shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-slate leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {cs.quote && (
            <figure className="rounded-3xl border border-cyan/20 bg-obsidian relative overflow-hidden p-8 md:p-10">
              <Quote className="w-8 h-8 text-cyan/40 mb-4" />
              <blockquote className="font-heading text-2xl text-platinum leading-snug mb-6">
                “{cs.quote.text}”
              </blockquote>
              <figcaption>
                <div className="font-semibold text-platinum">{cs.quote.author}</div>
                <div className="text-sm text-slate">{cs.quote.role}</div>
              </figcaption>
            </figure>
          )}

          <div>
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-4">Channels &amp; Stack</div>
            <div className="flex flex-wrap gap-2">
              {cs.stack.map((s) => (
                <span key={s} className="font-data text-xs text-platinum px-3 py-1.5 rounded-lg bg-fg/5 border border-fg/10">{s}</span>
              ))}
            </div>
          </div>

          {/* Next + CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            <Link
              href={`/portfolio/${next.slug}`}
              className="group rounded-2xl border border-fg/10 bg-obsidian p-6 hover:border-cyan/40 transition-colors"
            >
              <div className="font-data text-[11px] uppercase tracking-wider text-slate mb-2">Next case study</div>
              <div className="font-heading text-lg font-bold text-platinum group-hover:text-cyan transition-colors flex items-center gap-2">
                {next.client} <ArrowRight className="w-4 h-4" />
              </div>
              <div className="text-sm text-slate mt-1">{next.sector}</div>
            </Link>
            <Link
              href="/audit"
              className="group rounded-2xl border border-cyan/30 bg-cyan/5 p-6 hover:bg-cyan/10 transition-colors"
            >
              <div className="font-data text-[11px] uppercase tracking-wider text-cyan mb-2">Want results like these?</div>
              <div className="font-heading text-lg font-bold text-platinum flex items-center gap-2">
                Get a free growth audit <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
