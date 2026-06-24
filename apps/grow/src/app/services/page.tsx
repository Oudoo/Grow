"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FlaskConical, Repeat, Check } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/LanguageContext";
import { services } from "@/data/services";

const ICONS: Record<string, typeof Sparkles> = { Sparkles, FlaskConical, Repeat };

export default function ServicesPage() {
  const { t, language } = useLanguage();

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Header */}
      <section className="w-full py-20 bg-void border-b border-fg/5 relative overflow-hidden">
        {/* mesh-grid blueprint backdrop */}
        <div className="absolute inset-0 mesh-grid opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan mb-4">{t("services.page.eyebrow")}</div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-platinum mb-6">{t("services.page.title")}</h1>
            <p className="text-xl text-slate max-w-2xl mx-auto">{t("services.page.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Service groups */}
      <section className="w-full py-16 bg-void">
        <div className="container mx-auto px-4 max-w-6xl space-y-16">
          {services.map((group, gi) => {
            const Icon = ICONS[group.icon] ?? Sparkles;
            return (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-cyan" />
                  </div>
                  <div>
                    <div className="font-data text-[10px] uppercase tracking-widest text-slate">0{gi + 1} / {services.length < 10 ? "0" : ""}{services.length}</div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-platinum">{language === "ar" ? group.groupAr : group.group}</h2>
                    <p className="text-slate text-sm mt-1">{language === "ar" ? group.blurbAr : group.blurb}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.services.map((sv) => (
                    <Card key={sv.name} className="p-6 group bg-obsidian hover:border-cyan/40 transition-all duration-300 relative">
                      {sv.badge && (
                        <span className="absolute top-4 right-4 font-data text-[9px] uppercase tracking-wide text-amethyst border border-amethyst/30 rounded-full px-2 py-0.5">
                          {language === "ar" ? sv.badgeAr : sv.badge}
                        </span>
                      )}
                      <div className="w-9 h-9 rounded-lg bg-cyan/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Check className="w-4 h-4 text-cyan" />
                      </div>
                      <h3 className="font-heading text-base font-bold text-platinum mb-2 leading-tight pr-16">{language === "ar" ? sv.nameAr : sv.name}</h3>
                      <p className="text-slate text-sm leading-relaxed">{language === "ar" ? sv.descAr : sv.desc}</p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20 bg-obsidian border-t border-fg/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-platinum mb-4">{t("services.page.cta.title")}</h2>
            <p className="text-slate text-lg mb-8">{t("services.page.cta.desc")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/audit" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cyan text-white font-bold hover:bg-cyan/90 hover:shadow-[0_0_22px_rgba(79,70,229,0.5)] transition-all">
                {t("nav.audit")} <ArrowRight className={`w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`} />
              </Link>
              <Link href="/suites" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-fg/15 text-platinum font-bold hover:bg-fg/5 transition-all">
                {t("services.upsell.cta")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
