"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Network, ServerCrash, Cpu } from "lucide-react";

export function LegacyVsGrowSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full max-w-5xl mx-auto my-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-platinum mb-4">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Chaos</span> vs. The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-amethyst">Clarity</span>
        </h2>
        <p className="text-slate max-w-2xl mx-auto">
          Slide to reveal how GROW consolidates fragmented agencies, tools, and data into one unified growth infrastructure.
        </p>
      </div>

      <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden border border-fg/20 select-none">
        
        {/* Background Layer: GROW State (The "After") */}
        <div className="absolute inset-0 bg-void flex items-center justify-center overflow-hidden">
          {/* Unified GROW Network */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan/10 via-void to-void"></div>
          <div className="relative z-10 w-full h-full flex flex-col justify-center">
            {/* Distributed Network Pattern */}
            <div className="flex justify-between items-center w-full px-8 md:px-24">
              {/* Subtle Connection Line */}
              <div className="absolute left-8 right-8 md:left-24 md:right-24 h-[2px] bg-gradient-to-r from-cyan/20 via-amethyst to-cyan/20 z-0"></div>
              
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative z-10">
                  {i === 3 ? (
                    <motion.div 
                      animate={{ boxShadow: ["0 0 40px rgba(79, 70, 229, 0.2)", "0 0 80px rgba(67, 56, 202, 0.4)", "0 0 40px rgba(79, 70, 229, 0.2)"] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="w-20 h-20 md:w-32 md:h-32 bg-void rounded-full border border-cyan/50 flex items-center justify-center relative shadow-[0_0_30px_rgba(79,70,229,0.15)]"
                    >
                      <Cpu className="w-10 h-10 md:w-12 md:h-12 text-cyan" />
                      <div className="absolute inset-0 rounded-full border border-cyan animate-ping opacity-20"></div>
                    </motion.div>
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-void border border-amethyst/50 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(67,56,202,0.2)]">
                      <Network className="w-6 h-6 md:w-8 md:h-8 text-amethyst" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <h3 className="absolute bottom-10 right-10 text-xl md:text-2xl font-bold text-cyan tracking-widest uppercase text-right">Unified Intelligence</h3>
          </div>
        </div>

        {/* Foreground Layer: Legacy State (The "Before") clipped by slider */}
        <div 
          className="absolute inset-0 bg-[#1A1A1A] flex items-center justify-center overflow-hidden border-r-2 border-white"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          {/* Messy Red Network */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-10"></div>
          <div className="relative z-10 w-full h-full flex flex-col justify-center">
            
            <div className="flex justify-between items-center w-full px-8 md:px-24 relative">
              {/* Tangled SVG Lines */}
              <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-24 pointer-events-none z-0">
                <path d="M 0,48 Q 200,0 400,96 T 800,0 T 1200,48" stroke="#EF4444" strokeWidth="2" fill="none" className="opacity-40" strokeDasharray="5,5" />
                <path d="M 0,24 Q 200,96 400,0 T 800,96 T 1200,24" stroke="#F59E0B" strokeWidth="2" fill="none" className="opacity-40" />
              </svg>

              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative z-10">
                  {i === 3 ? (
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-[#1A1A1A] rounded-full border border-red-500/30 flex items-center justify-center relative shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <ServerCrash className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1A1A1A] border border-red-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <ServerCrash className="w-6 h-6 md:w-8 md:h-8 text-red-400 opacity-80" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <h3 className="absolute bottom-10 left-10 text-xl md:text-2xl font-bold text-red-500 tracking-widest uppercase line-through text-left">Fragmented Silos</h3>
          </div>
        </div>

        {/* Custom Slider Input */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderPosition} 
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />

        {/* Slider Handle Visual */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white z-10 pointer-events-none flex items-center justify-center"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-0.5 h-3 bg-obsidian rounded"></div>
              <div className="w-0.5 h-3 bg-obsidian rounded"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
