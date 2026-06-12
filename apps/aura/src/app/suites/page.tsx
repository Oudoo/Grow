"use client";

import { motion } from "framer-motion";
import { ArrowRight, Box, Layers, Package } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/LanguageContext";

export default function SuitesPage() {
  const { t, language, ecosystem } = useLanguage();
  
  // The ultimate bundle is our spotlight product
  const bundle = ecosystem.find((s) => s.slug === "ultimate-bundle");
  const coreSuites = ecosystem.filter((s) => s.slug !== "ultimate-bundle");

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Header Section */}
      <section className="w-full py-20 bg-void border-b border-fg/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-platinum mb-6 text-glow">
              {t("suites.title")}
            </h1>
            <p className="text-xl text-slate max-w-2xl mx-auto">
              {t("suites.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Spotlight Bundle Section */}
      <section className="w-full py-12 bg-obsidian">
        <div className="container mx-auto px-4 max-w-5xl">
          {bundle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-10 border-cyan/30 shadow-[0_0_40px_rgba(79,70,229,0.1)] relative overflow-visible">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amethyst/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0 w-24 h-24 rounded-full bg-cyan/10 flex items-center justify-center border border-cyan/20">
                    <Package className="w-12 h-12 text-cyan" />
                  </div>
                  <div className="flex-1 text-center md:text-start">
                    <div className="text-sm font-bold text-cyan tracking-widest uppercase mb-2">Premiere Offering</div>
                    <h2 className="text-3xl font-heading font-bold text-platinum mb-3">{t("suites.bundle.title")}</h2>
                    <p className="text-slate mb-6">
                      {t("suites.bundle.desc")}
                    </p>
                    <Link
                      href={`/products/${bundle.products[0].slug}`}
                      className="inline-flex items-center px-6 py-3 bg-cyan text-void font-bold rounded-full hover:bg-cyan/90 transition-colors"
                    >
                      {t("suites.view_products")}
                      <ArrowRight className={`w-4 h-4 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`} />
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bento Grid Core Suites */}
      <section className="w-full py-20 bg-void">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreSuites.map((suite, index) => (
              <motion.div
                key={suite.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full p-8 group hover:border-amethyst/50 transition-all duration-300">
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-fg/5 border border-fg/10 flex items-center justify-center mb-6 text-platinum group-hover:text-amethyst group-hover:bg-amethyst/10 transition-colors">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-platinum mb-4 group-hover:text-amethyst transition-colors">
                      {language === "ar" && suite.suiteAr ? suite.suiteAr : suite.suite}
                    </h3>
                    <div className="space-y-3 flex-1">
                      {suite.products.slice(0, 3).map((product) => (
                        <Link 
                          key={product.slug} 
                          href={`/products/${product.slug}`}
                          className="flex items-center text-sm text-slate hover:text-cyan transition-colors"
                        >
                          <Box className={`w-3 h-3 ${language === "ar" ? "ml-2" : "mr-2"} text-cyan`} />
                          <span className="line-clamp-1">{language === "ar" && product.nameAr ? product.nameAr : product.name}</span>
                        </Link>
                      ))}
                      {suite.products.length > 3 && (
                        <div className="text-xs font-medium text-slate/60 pt-2">
                          + {suite.products.length - 3} more modules
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
