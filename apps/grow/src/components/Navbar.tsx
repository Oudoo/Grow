"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Globe, Menu, X, Sparkles, FlaskConical, Repeat, Palette, Cpu, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "./LanguageContext";
import { services as serviceGroups } from "@/data/services";
import { isCreativeSuite } from "@/data/services";

const SERVICE_ICONS: Record<string, typeof Sparkles> = { Sparkles, FlaskConical, Repeat };

export function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language, toggleLanguage, ecosystem } = useLanguage();

  const creativeSuites = ecosystem.filter((s) => isCreativeSuite(s));
  const techSuites = ecosystem.filter((s) => !isCreativeSuite(s));

  const menus = {
    methodology: {
      title: t("nav.methodology"),
      href: "/methodology",
      content: (
        <div className="grid grid-cols-3 gap-6 p-6 w-[800px]">
          <div className="space-y-3">
            <h4 className="text-platinum font-semibold text-sm border-b border-fg/10 pb-2">{t("methodology.1.title")}</h4>
            <p className="text-xs text-slate">{t("methodology.1.desc")}</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-platinum font-semibold text-sm border-b border-fg/10 pb-2">{t("methodology.2.title")}</h4>
            <p className="text-xs text-slate">{t("methodology.2.desc")}</p>
          </div>
          <div className="space-y-3">
            <h4 className="text-platinum font-semibold text-sm border-b border-fg/10 pb-2">{t("methodology.3.title")}</h4>
            <p className="text-xs text-slate">{t("methodology.3.desc")}</p>
          </div>
        </div>
      ),
    },
    services: {
      title: t("nav.services"),
      href: "/services",
      content: (
        <div className="w-[860px] p-6">
          <div className="flex items-center justify-between border-b border-fg/10 pb-3 mb-4">
            <div>
              <div className="font-data text-[10px] uppercase tracking-[0.25em] text-cyan">{t("nav.services.eyebrow")}</div>
              <h4 className="text-platinum font-bold text-sm mt-1">{t("nav.services.title")}</h4>
            </div>
            <Link href="/services" onClick={() => setActiveMenu(null)} className="text-xs text-cyan hover:text-amethyst font-semibold flex items-center gap-1">
              {t("nav.services.all")} <ArrowRight className={`w-3 h-3 ${language === "ar" ? "rotate-180" : ""}`} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {serviceGroups.map((g) => {
              const Icon = SERVICE_ICONS[g.icon] ?? Sparkles;
              return (
                <div key={g.group} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan" />
                    </div>
                    <h5 className="text-xs font-bold text-platinum leading-tight">{language === "ar" ? g.groupAr : g.group}</h5>
                  </div>
                  <ul className="space-y-2">
                    {g.services.map((sv) => (
                      <li key={sv.name}>
                        <Link href="/services" onClick={() => setActiveMenu(null)} className="group block">
                          <span className="text-xs text-slate group-hover:text-cyan transition-colors leading-tight flex items-start gap-1.5">
                            <span className="break-words">{language === "ar" ? sv.nameAr : sv.name}</span>
                            {sv.badge && (
                              <span className="shrink-0 font-data text-[8px] uppercase tracking-wide text-amethyst border border-amethyst/30 rounded px-1 py-0.5">
                                {language === "ar" ? sv.badgeAr : sv.badge}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    suites: {
      title: t("nav.suites"),
      href: "/suites",
      content: (
        <div className="w-[820px] p-6">
          <div className="border-b border-fg/10 pb-3 mb-4">
            <div className="font-data text-[10px] uppercase tracking-[0.25em] text-cyan">{t("nav.suites.eyebrow")}</div>
            <h4 className="text-platinum font-bold text-sm mt-1">{t("nav.suites.title")}</h4>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {ecosystem.filter((s) => s.slug !== "ultimate-bundle").map((suite) => (
              <div key={suite.slug} className="group cursor-pointer" onClick={() => setActiveMenu(null)}>
                <Link href="/suites" className="block">
                  <h4 className="text-platinum font-semibold text-sm border-b border-fg/10 pb-2 group-hover:text-cyan transition-colors flex items-center justify-between gap-2">
                    <span>{language === "ar" && suite.suiteAr ? suite.suiteAr : suite.suite}</span>
                    <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all shrink-0 ${language === "ar" ? "rotate-180" : ""}`} />
                  </h4>
                  <p className="text-xs text-slate mt-2">{(language === "ar" ? suite.products[0]?.descAr : suite.products[0]?.description) ?? ""}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    products: {
      title: t("nav.products"),
      href: "/products",
      content: (
        <div className="w-[860px] p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Creative products */}
            <div>
              <div className="flex items-center gap-2 border-b border-fg/10 pb-2 mb-3">
                <Palette className="w-4 h-4 text-cyan" />
                <h4 className="text-xs font-bold text-platinum uppercase tracking-wide">{t("nav.products.creative")}</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4 max-h-[340px] overflow-y-auto pr-2">
                {creativeSuites.map((suite) => (
                  <div key={suite.slug} className="space-y-2">
                    <h5 className="text-[11px] font-semibold text-platinum/80">{language === "ar" && suite.suiteAr ? suite.suiteAr : suite.suite}</h5>
                    <ul className="space-y-1.5">
                      {suite.products.map((product) => (
                        <li key={product.slug}>
                          <Link href={`/products/${product.slug}`} className="text-xs text-slate hover:text-cyan transition-colors leading-tight block" onClick={() => setActiveMenu(null)}>
                            {language === "ar" && product.nameAr ? product.nameAr : product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            {/* Tech products */}
            <div>
              <div className="flex items-center gap-2 border-b border-fg/10 pb-2 mb-3">
                <Cpu className="w-4 h-4 text-amethyst" />
                <h4 className="text-xs font-bold text-platinum uppercase tracking-wide">{t("nav.products.tech")}</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4 max-h-[340px] overflow-y-auto pr-2">
                {techSuites.map((suite) => (
                  <div key={suite.slug} className="space-y-2">
                    <h5 className="text-[11px] font-semibold text-platinum/80">{language === "ar" && suite.suiteAr ? suite.suiteAr : suite.suite}</h5>
                    <ul className="space-y-1.5">
                      {suite.products.map((product) => (
                        <li key={product.slug}>
                          <Link href={`/products/${product.slug}`} className="text-xs text-slate hover:text-cyan transition-colors leading-tight block" onClick={() => setActiveMenu(null)}>
                            {language === "ar" && product.nameAr ? product.nameAr : product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    about: {
      title: t("nav.about"),
      href: "/about",
      content: (
        <div className="p-6 w-[350px]">
          <h4 className="text-platinum font-semibold text-sm border-b border-fg/10 pb-2 mb-3">{t("nav.about.title")}</h4>
          <p className="text-xs text-slate leading-relaxed mb-4">
            {t("nav.about.desc")}
          </p>
          <Link href="/about" className="text-xs text-cyan hover:text-amethyst transition-colors flex items-center gap-1 font-semibold" onClick={() => setActiveMenu(null)}>
            {t("nav.about.link")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-fg/5 bg-obsidian/60 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={() => setMobileOpen(false)}>
          <Image src="/logo.svg" alt="GROW" width={32} height={32} className="h-8 w-auto" />
          <span className="font-heading font-extrabold text-xl tracking-tight text-platinum">
            GROW
          </span>
        </Link>

        {/* Desktop nav — in-flow flex (no absolute centering), so it can never
            overlap the action cluster at tight widths. */}
        <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-x-5 h-full" onMouseLeave={() => setActiveMenu(null)}>
          {Object.entries(menus).map(([key, menu]) => (
            <div
              key={key}
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu(key)}
            >
              <Link href={menu.href} className="flex items-center gap-1 text-sm font-medium text-slate hover:text-platinum transition-colors whitespace-nowrap">
                <span>{menu.title}</span>
                <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
              </Link>

              <AnimatePresence>
                {activeMenu === key && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: 10, rotateX: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 perspective-1000"
                  >
                    <div className="bg-obsidian border border-fg/10 rounded-2xl shadow-2xl overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-fg/5 to-transparent pointer-events-none" />
                      <div className="relative z-10">{menu.content}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <Link
            href="/portfolio"
            className="flex items-center text-sm font-medium text-slate hover:text-platinum transition-colors whitespace-nowrap"
            onClick={() => setActiveMenu(null)}
          >
            {language === "ar" ? "أعمالنا" : "Portfolio"}
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Action-grabbing CTA */}
          <Link
            href="/audit"
            className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white whitespace-nowrap bg-cyan hover:bg-cyan/90 hover:shadow-[0_0_22px_rgba(79,70,229,0.5)] transition-all duration-300 group"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span className="hidden xl:inline">{t("nav.audit")}</span>
            <span className="xl:hidden">{t("nav.audit.short")}</span>
          </Link>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-slate hover:text-platinum transition-colors px-2 py-1"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{language === "en" ? "AR" : "EN"}</span>
          </button>

          <ThemeToggle />

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 rounded-lg text-platinum hover:bg-fg/5 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-fg/5 bg-obsidian/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {Object.entries(menus).map(([key, menu]) => (
                <Link
                  key={key}
                  href={menu.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-platinum hover:bg-fg/5 transition-colors"
                >
                  <span>{menu.title}</span>
                  <ArrowRight className={`w-4 h-4 text-slate ${language === "ar" ? "rotate-180" : ""}`} />
                </Link>
              ))}
              <Link
                href="/portfolio"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-platinum hover:bg-fg/5 transition-colors"
              >
                <span>{language === "ar" ? "أعمالنا" : "Portfolio"}</span>
                <ArrowRight className={`w-4 h-4 text-slate ${language === "ar" ? "rotate-180" : ""}`} />
              </Link>
              <Link
                href="/audit"
                onClick={() => setMobileOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-cyan text-white text-sm font-bold hover:bg-cyan/90 transition-colors"
              >
                <Zap className="w-4 h-4 fill-white" />
                {t("nav.audit")}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
