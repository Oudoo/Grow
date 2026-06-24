"use client";

import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export function HeroDiagnosisForm() {
  const { t, language } = useLanguage();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const challengeKey = formData.get("challenge") as string;
    const query = formData.get("query") as string;
    
    // Resolve the selected challenge back to its English version for the WhatsApp message
    // so the support team understands it uniformly, or we can send the exact translated string.
    // The user requested: "with the msg typed in the search bar and the dropdown menu selection"
    const challengeText = t(challengeKey);
    
    // Construct the WhatsApp message
    const message = `Hello Grow Team,\n\nI am facing the following challenge: *${challengeText}*\n\nAdditional Details: ${query}\n\nI would like to request a diagnostic audit.`;
    const whatsappUrl = `https://wa.me/201066221112?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto mt-12 relative group"
    >
      <div className="absolute inset-0 bg-cyan/20 rounded-full blur-xl group-hover:bg-cyan/30 transition-colors duration-500 -z-10" />
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row items-center p-2 rounded-full glass border border-fg/20 bg-void/80 focus-within:border-cyan/50 transition-colors"
      >
        <div className={`w-full sm:w-auto px-4 py-2 flex items-center border-b sm:border-b-0 border-fg/10 ${language === "ar" ? "sm:border-l" : "sm:border-r"}`}>
          <Zap className={`w-5 h-5 text-cyan flex-shrink-0 ${language === "ar" ? "ml-2" : "mr-2"}`} />
          <select 
            name="challenge" 
            required 
            className="w-full sm:w-auto bg-transparent border-none text-platinum text-sm font-semibold focus:ring-0 focus:outline-none cursor-pointer appearance-none min-w-[200px]"
            defaultValue=""
          >
            <option value="" disabled className="bg-void text-slate">{t("hero.challenge.default")}</option>
            <option value="hero.challenge.1" className="bg-void text-platinum">{t("hero.challenge.1")}</option>
            <option value="hero.challenge.2" className="bg-void text-platinum">{t("hero.challenge.2")}</option>
            <option value="hero.challenge.3" className="bg-void text-platinum">{t("hero.challenge.3")}</option>
            <option value="hero.challenge.4" className="bg-void text-platinum">{t("hero.challenge.4")}</option>
          </select>
        </div>
        
        <input 
          name="query" 
          required 
          placeholder={t("hero.query.placeholder")}
          className="w-full flex-1 bg-transparent border-none px-4 py-3 text-platinum placeholder-slate/50 focus:outline-none focus:ring-0 text-sm"
        />
        
        <button 
          type="submit" 
          className={`w-full sm:w-auto bg-cyan hover:bg-cyan/90 text-void px-6 py-3 sm:p-3 rounded-full flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)] flex-shrink-0 mt-2 sm:mt-0 ${language === "ar" ? "sm:mr-2" : "sm:ml-2"}`}
        >
          <Search className="w-5 h-5" />
          <span className={`sm:hidden font-bold ${language === "ar" ? "mr-2" : "ml-2"}`}>{t("hero.diagnose.btn")}</span>
        </button>
      </form>
    </motion.div>
  );
}
