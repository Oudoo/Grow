"use client";

import { useState } from "react";
import { ArrowRight, Activity } from "lucide-react";


import { LegacyVsGrowSlider } from "@/components/LegacyVsGrowSlider";
import { InteractiveArchitectureBuilder } from "@/components/InteractiveArchitectureBuilder";
import { HeroDiagnosisForm } from "@/components/HeroDiagnosisForm";
import { submitAuditForm } from "@/app/audit/actions";
import { motion } from "framer-motion";
import { Cpu, Zap, Send, CheckCircle2, PenTool, Target, Newspaper, LineChart } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await submitAuditForm(formData);
      if (res?.success) {
        setFormSubmitted(true);
      } else {
        setFormError(res?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  const formT = {
    title: language === "ar" ? "اطلب تقييماً مؤسسياً" : "Request a Business Audit",
    subtitle: language === "ar" 
      ? "تحدث مع خبرائنا لتشخيص معوقاتك التشغيلية وتصميم خارطة طريق استراتيجية لمنصة GROW." 
      : "Speak with our strategists to diagnose your growth bottlenecks and design your GROW roadmap.",
    name: language === "ar" ? "الاسم الكامل" : "Full Name",
    email: language === "ar" ? "البريد الإلكتروني للعمل" : "Work Email",
    company: language === "ar" ? "اسم الشركة" : "Company Name",
    message: language === "ar" ? "أخبرنا عن التحديات التشغيلية (اختياري)" : "Tell us about your operational challenges (Optional)",
    submit: language === "ar" ? "إرسال الطلب" : "Submit Request",
    submitting: language === "ar" ? "جاري الإرسال..." : "Submitting...",
    successTitle: language === "ar" ? "تم استلام الطلب بنجاح" : "Request Received",
    successMsg: language === "ar" 
      ? "سيقوم أحد كبار مهندسينا بالتواصل معك قريباً لتحديد موعد التقييم المبدئي." 
      : "One of our senior engineers will contact you shortly to schedule your initial diagnostic.",
  };

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract Background Light Trails */}
        <div className="absolute inset-0 z-0 opacity-40">
          <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M0,50 Q25,25 50,50 T100,50"
              stroke="url(#cyan-grad)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.path
              d="M0,70 Q25,95 50,70 T100,70"
              stroke="url(#amethyst-grad)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1 }}
            />
            <defs>
              <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--obsidian)" />
                <stop offset="50%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="var(--obsidian)" />
              </linearGradient>
              <linearGradient id="amethyst-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--obsidian)" />
                <stop offset="50%" stopColor="var(--amethyst)" />
                <stop offset="100%" stopColor="var(--obsidian)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter text-platinum text-glow leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-slate font-body max-w-2xl mx-auto">
              {t("hero.subtitle")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-amethyst font-semibold">
                {t("hero.subtitle.highlight")}
              </span>.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/audit"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-void transition-all duration-200 bg-cyan border border-transparent rounded-full hover:bg-cyan/90 hover:shadow-[0_0_20px_rgba(79,70,229,0.35)]"
              >
                {t("hero.explore")}
                <ArrowRight className={`w-5 h-5 transition-transform ${language === "ar" ? "mr-2 group-hover:-translate-x-1 rotate-180" : "ml-2 group-hover:translate-x-1"}`} />
              </Link>
              <Link
                href="https://wa.me/201066221112"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 font-bold text-platinum transition-all duration-200 bg-transparent border border-fg/10 rounded-full hover:bg-fg/5"
              >
                {t("hero.contact")}
              </Link>
            </div>

            <HeroDiagnosisForm />
          </motion.div>
        </div>
      </section>

      {/* The Agency Practice — services first */}
      <section className="w-full py-24 bg-obsidian/60 relative border-y border-fg/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="font-data text-xs uppercase tracking-[0.3em] text-cyan">{t("services.eyebrow")}</div>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-platinum">{t("services.title")}</h2>
            <p className="text-slate text-lg max-w-2xl mx-auto">{t("services.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: PenTool, key: 1 },
              { icon: Target, key: 2 },
              { icon: Newspaper, key: 3 },
              { icon: LineChart, key: 4 },
            ].map(({ icon: Icon, key }) => (
              <Card key={key} className="p-8 group bg-void hover:border-cyan/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-cyan" />
                </div>
                <div className="font-data text-[10px] uppercase tracking-widest text-slate mb-2">0{key}</div>
                <h3 className="text-xl font-heading font-bold text-platinum mb-3">{t(`services.${key}.title`)}</h3>
                <p className="text-slate text-sm leading-relaxed">{t(`services.${key}.desc`)}</p>
              </Card>
            ))}
          </div>

          {/* Business Solutions upsell band */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl mx-auto mt-10"
          >
            <div className="rounded-2xl bg-cyan text-white p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.07] pointer-events-none font-data text-[10px] leading-4 p-4 select-none">
                {"INFRASTRUCTURE / ECOSYSTEMS / PREDICTIVE MODELING / ".repeat(40)}
              </div>
              <div className="relative z-10 max-w-2xl space-y-3">
                <h3 className="font-heading text-2xl md:text-4xl font-bold">{t("services.upsell.title")}</h3>
                <p className="text-white/80 leading-relaxed">{t("services.upsell.desc")}</p>
              </div>
              <Link
                href="/suites"
                className="relative z-10 shrink-0 inline-flex items-center justify-center px-8 py-4 font-bold bg-white text-cyan rounded-full hover:bg-white/90 transition-all"
              >
                {t("services.upsell.cta")}
                <ArrowRight className={`w-5 h-5 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Slider Section */}
      <section className="w-full py-20 bg-void relative overflow-hidden">
        <LegacyVsGrowSlider />
      </section>

      {/* Methodology Section */}
      <section className="w-full py-24 bg-void relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-platinum">{t("methodology.title")}</h2>
            <p className="text-slate text-lg max-w-2xl mx-auto">{t("methodology.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 group hover:border-cyan/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-cyan" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-platinum mb-3">{t("methodology.1.title")}</h3>
              <p className="text-slate leading-relaxed">
                {t("methodology.1.desc")}
              </p>
            </Card>

            <Card className="p-8 group hover:border-amethyst/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-amethyst/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6 text-amethyst" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-platinum mb-3">{t("methodology.2.title")}</h3>
              <p className="text-slate leading-relaxed">
                {t("methodology.2.desc")}
              </p>
            </Card>

            <Card className="p-8 group hover:border-fg/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-fg/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-platinum" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-platinum mb-3">{t("methodology.3.title")}</h3>
              <p className="text-slate leading-relaxed">
                {t("methodology.3.desc")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Architecture Builder Section */}
      <section className="w-full py-10 bg-void relative overflow-hidden border-t border-fg/5">
        <InteractiveArchitectureBuilder />
      </section>

      {/* Dashboard Command Center Showcase Section */}
      <section className="w-full py-32 bg-gradient-to-b from-void to-obsidian relative overflow-hidden">
        {/* Glow behind dashboard */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amethyst/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-platinum text-glow">{t("dashboard.title")}</h2>
            <p className="text-slate text-lg max-w-2xl mx-auto">{t("dashboard.subtitle")}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-6xl mx-auto"
          >
            <div className="rounded-xl border border-fg/10 bg-obsidian/60 backdrop-blur-2xl shadow-[0_0_50px_rgba(67,56,202,0.15)] overflow-hidden">
              
              {/* Top KPI Bar */}
              <div className="grid grid-cols-3 border-b border-fg/5 bg-fg/[0.02]">
                <div className={`p-6 border-fg/5 text-center ${language === "ar" ? "border-l" : "border-r"}`}>
                  <div className="text-sm font-medium text-slate uppercase tracking-wider mb-1">{t("dashboard.kpi1.label")}</div>
                  <div className="text-3xl font-bold text-cyan text-glow" dir="ltr">{t("dashboard.kpi1.value")}</div>
                </div>
                <div className={`p-6 border-fg/5 text-center ${language === "ar" ? "border-l" : "border-r"}`}>
                  <div className="text-sm font-medium text-slate uppercase tracking-wider mb-1">{t("dashboard.kpi2.label")}</div>
                  <div className="text-3xl font-bold text-platinum text-glow" dir="ltr">{t("dashboard.kpi2.value")}</div>
                </div>
                <div className="p-6 text-center">
                  <div className="text-sm font-medium text-slate uppercase tracking-wider mb-1">{t("dashboard.kpi3.label")}</div>
                  <div className="text-3xl font-bold text-amethyst text-glow" dir="ltr">{t("dashboard.kpi3.value")}</div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-[400px]">
                
                {/* Center Widget: The Convergence Map */}
                <div className={`col-span-2 p-8 relative flex items-center justify-center border-fg/5 ${language === "ar" ? "border-l" : "border-r"}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan/5 via-transparent to-transparent pointer-events-none" />
                  
                  {/* SVG Convergence Node Graph */}
                  <div className="relative w-full max-w-md aspect-video" dir="ltr">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient id="hr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="var(--amethyst)" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="log-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="var(--amethyst)" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="fin-grad" x1="0%" y1="50%" x2="100%" y2="50%">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="var(--amethyst)" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Paths converging to center */}
                      <motion.path 
                        d="M 50,40 Q 150,40 250,100" 
                        fill="none" 
                        stroke="url(#hr-grad)" 
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.path 
                        d="M 50,100 Q 150,100 250,100" 
                        fill="none" 
                        stroke="url(#fin-grad)" 
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.path 
                        d="M 50,160 Q 150,160 250,100" 
                        fill="none" 
                        stroke="url(#log-grad)" 
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />

                      {/* Origin Nodes */}
                      <circle cx="50" cy="40" r="6" fill="var(--cyan)" filter="url(#glow)" />
                      <text x="35" y="44" fill="var(--slate)" fontSize="10" fontFamily="monospace" textAnchor="end">HR_API</text>
                      
                      <circle cx="50" cy="100" r="6" fill="#10B981" filter="url(#glow)" />
                      <text x="35" y="104" fill="var(--slate)" fontSize="10" fontFamily="monospace" textAnchor="end">FIN_DB</text>
                      
                      <circle cx="50" cy="160" r="6" fill="#F43F5E" filter="url(#glow)" />
                      <text x="35" y="164" fill="var(--slate)" fontSize="10" fontFamily="monospace" textAnchor="end">LOG_SYS</text>

                      {/* Central Core */}
                      <motion.circle 
                        cx="250" cy="100" r="20" 
                        fill="var(--amethyst)" 
                        filter="url(#glow)"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <circle cx="250" cy="100" r="10" fill="var(--platinum)" />
                      <text x="285" y="104" fill="var(--platinum)" fontSize="14" fontWeight="bold" filter="url(#glow)">GROW CORE</text>
                    </svg>
                  </div>
                </div>

                {/* Right Sidebar: Live AI Feed */}
                <div className="col-span-1 p-6 flex flex-col bg-void/50">
                  <h3 className="text-sm font-semibold text-platinum mb-4 flex items-center">
                    <div className={`w-2 h-2 rounded-full bg-cyan animate-pulse ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("dashboard.live_feed")}
                  </h3>
                  
                  <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void z-10 pointer-events-none" />
                    
                    <motion.div 
                      className="space-y-4 font-body text-xs absolute w-full"
                      animate={{ y: ["0%", "-50%"] }}
                      transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                    >
                      {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((item, idx) => (
                        <div key={idx} className={`p-3 rounded border ${idx % 2 === 0 ? "bg-fg/5 border-fg/5 text-slate" : "bg-cyan/5 border-cyan/10 text-cyan/90"}`}>
                          <span className={`${idx % 2 === 0 ? "text-amethyst" : "text-cyan"} font-bold`} dir="ltr">[{14}:0{item + 2}:{10 + item * 3}]</span> {t(`dashboard.feed.${item}`)}
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Embedded Contact Form Section */}
      <section className="w-full py-24 bg-void relative overflow-hidden">
        {/* Animated glow accents */}
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan/8 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amethyst/8 rounded-full blur-[100px] pointer-events-none"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Section Header */}
            <div className="text-center mb-12">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan/10 border border-cyan/20 mb-6"
              >
                <Send className="w-7 h-7 text-cyan" />
              </motion.div>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-platinum text-glow mb-4">
                {formT.title}
              </h2>
              <p className="text-slate text-lg max-w-xl mx-auto">
                {formT.subtitle}
              </p>
            </div>

            {/* Form Card */}
            <Card className="p-8 md:p-10 border-cyan/10 bg-obsidian/80 backdrop-blur-xl relative overflow-hidden">
              {/* Subtle animated border glow */}
              <div className="absolute inset-0 rounded-2xl border border-cyan/20 pointer-events-none" />
              
              {formSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-cyan/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-cyan" />
                  </div>
                  <h2 className="text-2xl font-bold text-platinum mb-2">{formT.successTitle}</h2>
                  <p className="text-slate">{formT.successMsg}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate uppercase tracking-wider">{formT.name}</label>
                      <input 
                        name="name"
                        required
                        className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum placeholder-slate/50 focus:outline-none focus:border-cyan transition-colors"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate uppercase tracking-wider">{formT.email}</label>
                      <input 
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum placeholder-slate/50 focus:outline-none focus:border-cyan transition-colors"
                        placeholder="jane@company.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate uppercase tracking-wider">{formT.company}</label>
                    <input 
                      name="company"
                      required
                      className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum placeholder-slate/50 focus:outline-none focus:border-cyan transition-colors"
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate uppercase tracking-wider">{formT.message}</label>
                    <textarea 
                      name="message"
                      rows={4}
                      className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum placeholder-slate/50 focus:outline-none focus:border-cyan transition-colors resize-none"
                      placeholder="..."
                    />
                  </div>

                  {formError && (
                    <p className="text-sm text-red-400 text-center" role="alert">
                      {formError}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={formLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-4 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {formLoading ? formT.submitting : formT.submit}
                    {!formLoading && <Send className={`w-4 h-4 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`} />}
                  </motion.button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
