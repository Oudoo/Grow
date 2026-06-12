"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingDown, AlertTriangle } from "lucide-react";

export function CostOfInactionTicker() {
  const [lostRevenue, setLostRevenue] = useState(14023); // Starting baseline

  useEffect(() => {
    // Increment by ~15 cents every 100ms ($1.50 per second) to simulate continuous heavy losses
    const interval = setInterval(() => {
      setLostRevenue((prev) => prev + 0.15);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="bg-red-500/5 border border-red-500/20 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-700 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-red-500/20 p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">The Cost of Inaction</h3>
      </div>
      
      <p className="text-xs text-slate mb-4">Estimated revenue lost to fragmented legacy systems during this session:</p>
      
      <div className="flex items-end gap-2 font-heading">
        <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          ${lostRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <motion.div 
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-2 text-red-400 flex items-center"
        >
          <TrendingDown className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold animate-pulse">Dropping</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
