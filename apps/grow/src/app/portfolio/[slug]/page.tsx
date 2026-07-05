import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Quote, Maximize2 } from "lucide-react";
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
      {/* Cinematic Hero */}
      <section className="w-full relative bg-void border-b border-fg/5">
        {cs.coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={cs.coverImage}
              alt={cs.title}
              fill
              className="object-cover opacity-40 mix-blend-screen"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-void/50 via-void/80 to-void" />
          </div>
        ) : (
          <div className="absolute inset-0 mesh-grid opacity-40 pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10 py-20 lg:py-28">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-slate hover:text-cyan transition-colors mb-8 backdrop-blur-sm bg-obsidian/30 px-3 py-1.5 rounded-full border border-fg/10">
            <ArrowLeft className="w-4 h-4" /> All case studies
          </Link>
          <div className="flex items-center gap-3 flex-wrap mb-5">
            <span className="font-data text-[11px] uppercase tracking-wider text-cyan px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 backdrop-blur-sm">{cs.sector}</span>
            <span className="font-data text-[11px] text-slate bg-obsidian/40 px-3 py-1 rounded-full border border-fg/5 backdrop-blur-sm">{cs.region}</span>
            <span className="font-data text-[11px] text-slate bg-obsidian/40 px-3 py-1 rounded-full border border-fg/5 backdrop-blur-sm">{cs.year}</span>
            <span className="font-data text-[11px] text-slate bg-obsidian/40 px-3 py-1 rounded-full border border-fg/5 backdrop-blur-sm">{cs.duration}</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-platinum leading-tight mb-6 drop-shadow-lg">{cs.title}</h1>
          <p className="text-lg md:text-xl text-slate/90 leading-relaxed max-w-3xl drop-shadow">{cs.summary}</p>
        </div>
      </section>

      {/* Results */}
      <section className="w-full py-12 bg-obsidian/50 border-b border-fg/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {cs.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-fg/10 bg-void/80 backdrop-blur-md px-6 py-8 text-center shadow-lg hover:border-cyan/30 transition-colors">
                <div className="font-heading text-4xl md:text-5xl font-bold text-cyan mb-3">{m.value}</div>
                <div className="text-sm text-slate leading-snug">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge + Approach */}
      <section className="w-full py-20 bg-void relative">
        <div className="container mx-auto px-4 max-w-4xl space-y-20 relative z-10">
          
          {/* Challenge Section */}
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-cyan/20 rounded-full" />
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-5 pl-4">The Challenge</div>
            <p className="text-slate text-lg md:text-xl leading-relaxed pl-4">{cs.challenge}</p>
          </div>

          {/* Visual Gallery Evidence (if images exist) */}
          {cs.galleryImages && cs.galleryImages.length > 0 && (
            <div className="py-8">
              <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-6 text-center">Visual Evidence</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cs.galleryImages.map((img, i) => (
                  <div key={i} className="group relative rounded-2xl overflow-hidden border border-fg/10 bg-obsidian aspect-video cursor-zoom-in">
                    <Image src={img} alt={`${cs.client} evidence ${i + 1}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-void/20 group-hover:bg-transparent transition-colors duration-500" />
                    <div className="absolute bottom-4 right-4 bg-void/60 backdrop-blur p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4 text-platinum" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approach Section */}
          <div>
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-8 text-center">What We Did</div>
            <ol className="space-y-6">
              {cs.approach.map((step, i) => (
                <li key={i} className="flex gap-6 rounded-2xl border border-fg/10 bg-obsidian/60 backdrop-blur p-8 hover:bg-obsidian transition-colors">
                  <span className="font-heading text-3xl text-cyan/40 font-bold shrink-0 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-slate text-lg leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Testimonial Quote */}
          {cs.quote && (
            <figure className="rounded-3xl border border-cyan/20 bg-gradient-to-br from-obsidian to-void relative overflow-hidden p-10 md:p-14 shadow-[0_0_40px_rgba(79,70,229,0.05)]">
              <Quote className="absolute top-8 right-8 w-32 h-32 text-cyan/5 -rotate-12" />
              <Quote className="w-10 h-10 text-cyan/50 mb-6 relative z-10" />
              <blockquote className="font-heading text-2xl md:text-3xl text-platinum leading-relaxed mb-8 relative z-10">
                “{cs.quote.text}”
              </blockquote>
              <figcaption className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                  <span className="font-heading font-bold text-cyan">{cs.quote.author.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-bold text-platinum text-lg">{cs.quote.author}</div>
                  <div className="text-sm text-cyan">{cs.quote.role}</div>
                </div>
              </figcaption>
            </figure>
          )}

          {/* Stack */}
          <div className="pt-8 border-t border-fg/5 text-center">
            <div className="font-data text-xs uppercase tracking-[0.3em] text-slate mb-6">Channels &amp; Stack</div>
            <div className="flex flex-wrap justify-center gap-3">
              {cs.stack.map((s) => (
                <span key={s} className="font-data text-xs text-platinum px-4 py-2 rounded-xl bg-obsidian border border-fg/10 hover:border-cyan/30 transition-colors shadow-sm">{s}</span>
              ))}
            </div>
          </div>

          {/* Next + CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-fg/5">
            <Link
              href={`/portfolio/${next.slug}`}
              className="group flex flex-col justify-center rounded-3xl border border-fg/10 bg-obsidian p-8 hover:border-cyan/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="font-data text-[11px] uppercase tracking-wider text-slate mb-3">Next case study</div>
              <div className="font-heading text-xl md:text-2xl font-bold text-platinum group-hover:text-cyan transition-colors flex items-center gap-2 mb-2">
                {next.client} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-sm text-slate">{next.sector}</div>
            </Link>
            <Link
              href="/audit"
              className="group flex flex-col justify-center rounded-3xl border border-cyan/30 bg-cyan/5 p-8 hover:bg-cyan/10 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="font-data text-[11px] uppercase tracking-wider text-cyan mb-3">Want results like these?</div>
                <div className="font-heading text-xl md:text-2xl font-bold text-platinum flex items-center gap-2">
                  Get a free growth audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
