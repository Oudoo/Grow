"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { caseStudies } from "@/data/portfolio";

const totals = [
  { value: "40+", label: "engagements delivered" },
  { value: "$18M+", label: "client ad spend managed" },
  { value: "9", label: "industries served" },
  { value: "93%", label: "client retention rate" },
];

export default function PortfolioPage() {
  const featured = caseStudies.filter((c) => c.featured);
  const rest = caseStudies.filter((c) => !c.featured);

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Hero */}
      <section className="w-full py-20 bg-void border-b border-fg/5 relative overflow-hidden">
        <div className="absolute inset-0 mesh-grid opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-4">Selected Work</div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-platinum mb-6">
              Results, documented.
            </h1>
            <p className="text-xl text-slate max-w-2xl mx-auto">
              Growth engagements across e-commerce, fintech, healthcare, real estate and SaaS —
              every number below is a system, not a lucky campaign.
            </p>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {totals.map((s) => (
              <div key={s.label} className="rounded-2xl border border-fg/10 bg-obsidian/60 px-4 py-5">
                <div className="font-heading text-3xl font-bold text-platinum">{s.value}</div>
                <div className="font-data text-[11px] uppercase tracking-wider text-slate mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured case studies */}
      <section className="w-full py-16 bg-void">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-8">Flagship Engagements</div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featured.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/portfolio/${c.slug}`}
                  className="group flex flex-col h-full rounded-2xl border border-fg/10 bg-obsidian p-7 hover:border-cyan/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-data text-[11px] uppercase tracking-wider text-cyan">{c.sector}</span>
                    <ArrowUpRight className="w-5 h-5 text-slate group-hover:text-cyan transition-colors" />
                  </div>
                  <div className="font-heading text-4xl font-bold text-platinum mb-1">{c.metrics[0].value}</div>
                  <div className="text-sm text-slate mb-5">{c.metrics[0].label}</div>
                  <h2 className="font-heading text-lg font-bold text-platinum leading-snug mb-3">{c.title}</h2>
                  <p className="text-sm text-slate leading-relaxed mb-6 flex-1">{c.summary}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-fg/5">
                    <span className="font-semibold text-sm text-platinum">{c.client}</span>
                    <span className="font-data text-[11px] text-slate">{c.region}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All case studies */}
      <section className="w-full pb-20 bg-void">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-8">More Case Studies</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rest.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 2) * 0.06 }}
              >
                <Link
                  href={`/portfolio/${c.slug}`}
                  className="group flex flex-col h-full rounded-2xl border border-fg/10 bg-obsidian p-6 hover:border-cyan/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="font-data text-[11px] uppercase tracking-wider text-cyan">{c.sector}</span>
                    <span className="font-data text-[11px] text-slate">· {c.region}</span>
                    <span className="font-data text-[11px] text-slate">· {c.year}</span>
                  </div>
                  <h2 className="font-heading text-lg font-bold text-platinum leading-snug mb-4 group-hover:text-cyan transition-colors">
                    {c.title}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {c.metrics.slice(0, 2).map((m) => (
                      <div key={m.label} className="rounded-xl bg-fg/5 px-3 py-2.5">
                        <div className="font-heading text-xl font-bold text-platinum">{m.value}</div>
                        <div className="text-[11px] text-slate leading-tight mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-fg/5">
                    <span className="font-semibold text-sm text-platinum">{c.client}</span>
                    <span className="text-xs text-cyan flex items-center gap-1 font-semibold">
                      Read case study <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-3xl border border-fg/10 bg-obsidian relative overflow-hidden">
            <div className="absolute inset-0 mesh-grid opacity-30 pointer-events-none" />
            <div className="relative z-10 px-8 py-12 text-center">
              <h3 className="font-heading text-3xl font-bold text-platinum mb-3">Your project could be next.</h3>
              <p className="text-slate max-w-xl mx-auto mb-7">
                Start with a free growth audit — we&apos;ll show you exactly where the numbers above would come from in your business.
              </p>
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white bg-cyan hover:bg-cyan/90 hover:shadow-[0_0_22px_rgba(79,70,229,0.5)] transition-all duration-300"
              >
                Get your free audit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
