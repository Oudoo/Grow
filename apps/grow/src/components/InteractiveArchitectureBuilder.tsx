"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Truck, Users, PieChart, Shield, Bot, Factory, Server, ChevronRight, X, LayoutGrid } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const icons = [Database, Truck, Users, PieChart, Shield, Bot, Factory, Server, LayoutGrid];
const colors = ["text-blue-400", "text-green-400", "text-yellow-400", "text-cyan", "text-amethyst", "text-red-400", "text-orange-400", "text-pink-400", "text-emerald-400"];
const borders = ["border-blue-400/30", "border-green-400/30", "border-yellow-400/30", "border-cyan/30", "border-amethyst/30", "border-red-400/30", "border-orange-400/30", "border-pink-400/30", "border-emerald-400/30"];

export function InteractiveArchitectureBuilder() {
  const { ecosystem, language } = useLanguage();
  // By default make the first suite active
  const defaultSuite = ecosystem[0]?.slug || "";
  const [activeNodes, setActiveNodes] = useState<string[]>([defaultSuite]);

  const toggleNode = (slug: string) => {
    if (activeNodes.includes(slug)) {
      if (activeNodes.length > 1) { // keep at least one active
        setActiveNodes(activeNodes.filter(node => node !== slug));
      }
    } else {
      setActiveNodes([...activeNodes, slug]);
    }
  };

  return (
    <div className="py-20 w-full max-w-7xl mx-auto">
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-platinum mb-4">
          Architect Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-amethyst">Digital Future</span>
        </h2>
        <p className="text-slate max-w-2xl mx-auto">
          Click the modules below to build your custom Grow ecosystem. Watch as data silos dissolve into a unified source of truth.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        {/* Module Selection Panel */}
        <div className="lg:col-span-4 bg-obsidian border border-fg/10 rounded-3xl p-6 flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold text-platinum mb-2 uppercase tracking-widest">Available Modules</h3>
          
          {ecosystem.map((suite, index) => {
            const isActive = activeNodes.includes(suite.slug);
            const Icon = icons[index % icons.length];
            const colorClass = colors[index % colors.length];
            const borderClass = borders[index % borders.length];
            const suiteName = language === "ar" && suite.suiteAr ? suite.suiteAr : suite.suite;

            return (
              <button
                key={suite.slug}
                onClick={() => toggleNode(suite.slug)}
                className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? `bg-void ${borderClass} shadow-[0_0_15px_rgba(255,255,255,0.05)]` 
                    : "bg-void border-fg/5 hover:border-fg/20 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`p-2 rounded-lg bg-obsidian ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-bold ${isActive ? "text-platinum" : "text-slate"}`}>
                    {suiteName}
                  </span>
                </div>
                {isActive ? (
                  <X className="w-4 h-4 text-slate hover:text-red-400 transition-colors flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Canvas Panel */}
        <div className="lg:col-span-8 bg-void border border-fg/10 rounded-3xl p-8 relative flex items-center justify-center min-h-[600px] overflow-hidden">
          {/* Subtle Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-12 md:gap-20 z-10 p-10">
            <AnimatePresence>
              {ecosystem.map((suite, index) => {
                if (!activeNodes.includes(suite.slug)) return null;
                const Icon = icons[index % icons.length];
                const colorClass = colors[index % colors.length];
                const borderClass = borders[index % borders.length];
                const suiteName = language === "ar" && suite.suiteAr ? suite.suiteAr : suite.suite;
                
                return (
                  <motion.div
                    key={suite.slug}
                    layoutId={`node-${suite.slug}`}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative flex items-center justify-center m-10"
                  >
                    {/* Connection Lines (Behind everything) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                      {suite.products.map((product, pIdx) => {
                         const totalProducts = suite.products.length;
                         const angle = (pIdx / totalProducts) * 2 * Math.PI - Math.PI / 2;
                         const radius = 160; 
                         const x = Math.cos(angle) * radius;
                         const y = Math.sin(angle) * radius;
                         return (
                            <line 
                              key={`line-${product.slug}`} 
                              x1="50%" y1="50%" 
                              x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                              stroke="currentColor" strokeWidth="1" 
                              className={`${colorClass} opacity-30`} 
                              strokeDasharray="4 4" 
                            />
                         )
                      })}
                    </svg>

                    {/* Main Suite Node */}
                    <div className={`relative z-20 w-32 h-32 md:w-40 md:h-40 bg-obsidian border-2 ${borderClass} rounded-2xl flex flex-col items-center justify-center p-4 shadow-2xl`}>
                      <div className={`absolute inset-0 bg-current opacity-5 blur-xl rounded-2xl ${colorClass}`}></div>
                      <Icon className={`w-10 h-10 mb-3 ${colorClass}`} />
                      <span className="text-xs font-bold text-platinum text-center leading-tight">
                        {suiteName}
                      </span>
                      <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-current ${colorClass}`}>
                        <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-50"></div>
                      </div>
                    </div>

                    {/* Satellite Product Branches */}
                    {suite.products.map((product, pIdx) => {
                      const totalProducts = suite.products.length;
                      const angle = (pIdx / totalProducts) * 2 * Math.PI - Math.PI / 2;
                      // Radius of the circle of satellites
                      const radius = 160; 
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      const productName = language === "ar" && product.nameAr ? product.nameAr : product.name;

                      return (
                        <motion.div
                          key={product.slug}
                          initial={{ opacity: 0, x: 0, y: 0 }}
                          animate={{ opacity: 1, x, y }}
                          exit={{ opacity: 0, x: 0, y: 0 }}
                          transition={{ duration: 0.5, delay: pIdx * 0.1 }}
                          className={`absolute z-10 w-32 p-2 bg-void border ${borderClass} rounded-lg flex flex-col items-center justify-center shadow-lg cursor-default group`}
                          style={{
                            // Transform from center
                            left: '50%',
                            top: '50%',
                            marginLeft: '-4rem', // Half of w-32 (8rem)
                            marginTop: '-1.5rem', // Approx half height
                          }}
                        >
                          <span className={`text-[10px] text-center font-semibold text-slate group-hover:text-platinum transition-colors`}>
                            {productName}
                          </span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
