"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only trigger once per session
    const hasSeenPopup = sessionStorage.getItem("grow_exit_intent");
    if (hasSeenPopup || pathname.startsWith('/admin') || pathname === '/audit-quiz') return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsVisible(true);
        sessionStorage.setItem("grow_exit_intent", "true");
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-obsidian border border-amethyst/30 rounded-2xl shadow-[0_0_100px_rgba(67,56,202,0.15)] relative overflow-hidden p-8 text-center"
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amethyst/20 blur-[60px] pointer-events-none" />

            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-2 text-slate hover:text-platinum transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <AlertTriangle className="w-16 h-16 text-amethyst mx-auto mb-6 drop-shadow-[0_0_15px_rgba(67,56,202,0.5)]" />
            
            <h2 className="text-3xl font-heading font-bold text-platinum mb-4">
              Wait. Fragmentation is Costing You Growth.
            </h2>

            <p className="text-slate mb-8 max-w-sm mx-auto leading-relaxed">
              Every quarter run on disconnected agencies, tools, and spreadsheets compounds wasted spend. Don&apos;t leave without measuring your growth bottlenecks.
            </p>

            <div className="flex flex-col space-y-3">
              <Link
                href="/audit-quiz"
                onClick={() => setIsVisible(false)}
                className="w-full py-4 bg-amethyst hover:bg-amethyst/90 text-void font-bold rounded-xl transition-colors flex items-center justify-center text-lg"
              >
                Take the Free Diagnostic
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button
                onClick={() => setIsVisible(false)}
                className="w-full py-4 bg-transparent text-slate hover:text-platinum font-medium transition-colors text-sm"
              >
                I&apos;m okay leaving growth on the table
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
