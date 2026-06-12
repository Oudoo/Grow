"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageContext";

export default function ProductsPage() {
  const [activeSuite, setActiveSuite] = useState<string>("all");
  const { t, language, ecosystem } = useLanguage();

  const allProducts = ecosystem.flatMap((suite) =>
    suite.products.map((p) => ({ ...p, suiteSlug: suite.slug, suiteName: suite.suite, suiteNameAr: suite.suiteAr }))
  );

  const filteredProducts =
    activeSuite === "all"
      ? allProducts
      : allProducts.filter((p) => p.suiteSlug === activeSuite);

  return (
    <main className="flex-1 flex flex-col items-center">
      <section className="w-full py-16 bg-void border-b border-fg/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-platinum mb-4">
            {t("products.title")}
          </h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            {t("products.subtitle")}
          </p>
        </div>
      </section>

      <section className="w-full py-8 sticky top-20 z-40 bg-void/80 backdrop-blur-xl border-b border-fg/5">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-4 hide-scrollbar space-x-2">
            <button
              onClick={() => setActiveSuite("all")}
              className={cn(
                "relative px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeSuite === "all" ? "text-void" : "text-slate hover:text-platinum bg-fg/5",
                language === "ar" && "ml-2"
              )}
            >
              {activeSuite === "all" && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-0 bg-cyan rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t("products.filter.all")}</span>
            </button>
            {ecosystem.map((suite) => (
              <button
                key={suite.slug}
                onClick={() => setActiveSuite(suite.slug)}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeSuite === suite.slug ? "text-void" : "text-slate hover:text-platinum bg-fg/5",
                  language === "ar" && "ml-2"
                )}
              >
                {activeSuite === suite.slug && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-cyan rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{language === "ar" && suite.suiteAr ? suite.suiteAr : suite.suite}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-16 bg-void min-h-screen">
        <div className="container mx-auto px-4">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/products/${product.slug}`}>
                    <Card className="h-full p-6 group hover:border-cyan/50 cursor-pointer flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-semibold text-cyan mb-2 uppercase tracking-wider">
                          {language === "ar" && product.suiteNameAr ? product.suiteNameAr : product.suiteName}
                        </div>
                        <h3 className="text-xl font-heading font-bold text-platinum mb-3 group-hover:text-cyan transition-colors">
                          {language === "ar" && product.nameAr ? product.nameAr : product.name}
                        </h3>
                        <p className="text-slate text-sm">
                          {language === "ar" && product.descAr ? product.descAr : product.description}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center text-sm font-medium text-slate group-hover:text-cyan transition-colors">
                        {t("products.view_details")}
                        {language === "ar" ? (
                          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        ) : (
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
