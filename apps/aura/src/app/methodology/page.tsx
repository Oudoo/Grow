"use client";

import { useLanguage } from "@/components/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Compass, Rocket, Database, Zap, Cpu, Network, BarChart, ShieldCheck } from "lucide-react";
import { useRef } from "react";

export default function MethodologyPage() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pipelineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const phases = [
    {
      title: t("methodology.1.title"),
      desc: t("methodology.1.desc"),
      icon: <Search className="w-8 h-8 text-cyan" />,
      subpoints: [
        { icon: <Database className="w-5 h-5 text-slate" />, text: t("methodology.1.sub1") },
        { icon: <Zap className="w-5 h-5 text-slate" />, text: t("methodology.1.sub2") },
        { icon: <ShieldCheck className="w-5 h-5 text-slate" />, text: t("methodology.1.sub3") }
      ]
    },
    {
      title: t("methodology.2.title"),
      desc: t("methodology.2.desc"),
      icon: <Compass className="w-8 h-8 text-amethyst" />,
      subpoints: [
        { icon: <Network className="w-5 h-5 text-slate" />, text: t("methodology.2.sub1") },
        { icon: <Cpu className="w-5 h-5 text-slate" />, text: t("methodology.2.sub2") },
        { icon: <BarChart className="w-5 h-5 text-slate" />, text: t("methodology.2.sub3") }
      ]
    },
    {
      title: t("methodology.3.title"),
      desc: t("methodology.3.desc"),
      icon: <Rocket className="w-8 h-8 text-cyan" />,
      subpoints: [
        { icon: <Zap className="w-5 h-5 text-slate" />, text: t("methodology.3.sub1") },
        { icon: <Network className="w-5 h-5 text-slate" />, text: t("methodology.3.sub2") },
        { icon: <BarChart className="w-5 h-5 text-slate" />, text: t("methodology.3.sub3") }
      ]
    },
  ];

  return (
    <main className="flex-1 w-full relative overflow-hidden bg-obsidian py-24 md:py-32">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-cyan/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-32"
        >
          <div className="inline-flex items-center gap-2 border border-cyan/30 bg-cyan/10 px-4 py-1.5 rounded-full text-cyan text-sm font-semibold tracking-wide uppercase mb-6">
            <Cpu className="w-4 h-4" /> {t("methodology.protocol")}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight text-platinum">
            {t("methodology.title")}
          </h1>
          <p className="text-xl text-slate leading-relaxed">
            {t("methodology.protocol.desc")}
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto" ref={containerRef}>
          {/* Scroll-Driven Data Pipeline */}
          <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-fg/5 -translate-x-1/2 rounded-full hidden md:block" />
          <div className="absolute left-[39px] top-0 bottom-0 w-1 bg-fg/5 -translate-x-1/2 rounded-full md:hidden" />
          
          <motion.div 
            className="absolute left-[39px] md:left-1/2 top-0 w-1 bg-gradient-to-b from-cyan via-amethyst to-cyan -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)] z-0"
            style={{ height: pipelineHeight }}
          />

          <div className="space-y-24 md:space-y-48 relative z-10">
            {phases.map((phase, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`flex flex-col md:flex-row items-start gap-8 md:gap-16 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Node */}
                  <div className="absolute left-[39px] md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-obsidian border-4 border-cyan flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] mt-6 md:mt-0 z-20">
                    <div className="w-4 h-4 bg-cyan rounded-full animate-pulse" />
                  </div>

                  {/* Content Container */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className={`w-full md:w-1/2 ${isEven ? 'md:pl-16' : 'md:pr-16'} pl-24 md:pl-0 pt-2`}
                  >
                    <div className="glass p-8 md:p-12 rounded-3xl relative group hover:border-cyan/30 transition-colors duration-500">
                      <div className="w-16 h-16 rounded-2xl bg-void border border-fg/10 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500">
                        {phase.icon}
                      </div>
                      <h2 className="text-3xl font-bold font-heading mb-4 text-platinum">
                        {phase.title}
                      </h2>
                      <p className="text-slate leading-relaxed mb-8 text-lg">
                        {phase.desc}
                      </p>
                      
                      <div className="space-y-4">
                        {phase.subpoints.map((sub, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-void/50 p-4 rounded-xl border border-fg/5 hover:bg-fg/5 transition-colors">
                            <div className="p-2 bg-obsidian rounded-lg shadow-inner">
                              {sub.icon}
                            </div>
                            <span className="text-sm font-medium text-platinum">{sub.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
