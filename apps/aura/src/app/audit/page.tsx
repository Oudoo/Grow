"use client";

import { motion } from "framer-motion";
import { BusinessAuditEngine } from "@/components/BusinessAuditEngine";
import { useLanguage } from "@/components/LanguageContext";

export default function AuditPage() {
  const { language } = useLanguage();

  const t = {
    title: language === "ar" ? "تقييم النضج الرقمي" : "Digital Maturity Assessment",
    subtitle: language === "ar"
      ? "أجب عن ١٢ سؤالاً سريعاً لتحصل على تقرير نضج رقمي مخصص لمؤسستك مع خارطة طريق عملية."
      : "Answer 12 quick questions to get a personalised digital maturity report and a practical roadmap for your organisation.",
  };

  return (
    <main className="flex-1 flex flex-col items-center py-24 md:py-28 bg-void relative overflow-hidden min-h-screen">
      <div className="absolute top-0 right-0 -mr-[400px] -mt-[400px] w-[800px] h-[800px] bg-cyan/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-[400px] -mb-[400px] w-[700px] h-[700px] bg-amethyst/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-platinum mb-4 text-glow">
              {t.title}
            </h1>
            <p className="text-slate text-lg">{t.subtitle}</p>
          </motion.div>
        </div>

        <BusinessAuditEngine />
      </div>
    </main>
  );
}
