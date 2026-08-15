"use client";

import { motion } from "framer-motion";
import { ArrowRight, Server, Activity, Shield, Crosshair } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function AboutPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { t } = useLanguage();

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <main className="flex-1 w-full bg-obsidian relative overflow-hidden">
      {/* 1. The Hero (The "Why") */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-bold font-heading tracking-tighter mb-8 text-platinum">
              {t("about.hero.title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-amethyst">{t("about.hero.highlight")}</span> {t("about.hero.title.end")}
            </h1>
            <p className="text-xl md:text-2xl text-slate max-w-3xl mx-auto leading-relaxed">
              {t("about.hero.desc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. The "Business Doctor" Diagnosis Phase */}
      <section className="py-24 bg-void relative border-y border-fg/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold font-heading text-platinum mb-4">{t("about.process.title")}</h2>
            <p className="text-slate text-lg">{t("about.process.subtitle")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                phase: "01",
                title: t("about.process.1.title"),
                desc: t("about.process.1.desc"),
                icon: <Activity className="w-6 h-6 text-cyan" />
              },
              {
                phase: "02",
                title: t("about.process.2.title"),
                desc: t("about.process.2.desc"),
                icon: <Crosshair className="w-6 h-6 text-amethyst" />
              },
              {
                phase: "03",
                title: t("about.process.3.title"),
                desc: t("about.process.3.desc"),
                icon: <Server className="w-6 h-6 text-cyan" />
              }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass p-8 rounded-3xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 text-6xl font-bold text-fg/[0.03] group-hover:text-cyan/10 transition-colors font-heading">
                  {step.phase}
                </div>
                <div className="w-12 h-12 rounded-xl bg-obsidian border border-fg/10 flex items-center justify-center mb-6 relative z-10">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold font-heading text-platinum mb-4 relative z-10">{step.title}</h3>
                <p className="text-slate leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Core Philosophy with Flashlight Spotlight */}
      <section 
        className="py-24 md:py-32 relative group cursor-crosshair"
        onMouseMove={handleMouseMove}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amethyst/10 rounded-full blur-[150px] pointer-events-none" />
        
        {/* Hidden Matrix Background revealed by mouse hover */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 z-0"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 70, 229, 0.15), transparent 40%)`,
          }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold font-heading text-platinum mb-8 group-hover:text-cyan transition-colors duration-700">
                {t("about.philosophy.title")}
              </h2>
              <div className="space-y-12">
                {[
                  {
                    title: t("about.philosophy.1.title"),
                    desc: t("about.philosophy.1.desc")
                  },
                  {
                    title: t("about.philosophy.2.title"),
                    desc: t("about.philosophy.2.desc")
                  },
                  {
                    title: t("about.philosophy.3.title"),
                    desc: t("about.philosophy.3.desc")
                  }
                ].map((pillar, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-cyan to-transparent" />
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
                    <h3 className="text-xl font-bold text-platinum mb-2 font-heading">{pillar.title}</h3>
                    <p className="text-slate leading-relaxed">{pillar.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[600px] rounded-3xl overflow-hidden glass border border-fg/10"
            >
              <div 
                className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: `radial-gradient(600px circle at ${mousePosition.x - 600}px ${mousePosition.y}px, rgba(67, 56, 202, 0.15), transparent 40%)`,
                }}
              />
              <div className="absolute inset-0 bg-void/50 flex flex-col items-center justify-center p-12 text-center z-10">
                <Shield className="w-16 h-16 text-amethyst mb-6 opacity-50" />
                <p className="text-slate font-mono text-sm tracking-widest uppercase">{t("about.philosophy.badge")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. The Proof Point (CTA) */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-platinum text-void" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-cyan/20 to-transparent rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold font-heading mb-8 text-void">
              {t("about.cta.title.start")} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-amethyst">{t("about.cta.title.highlight")}</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto">
              {t("about.cta.desc")}
            </p>
            
            <Link 
              href="/audit"
              className="inline-flex items-center gap-3 bg-void text-platinum px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)]"
            >
              {t("about.cta.button")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
