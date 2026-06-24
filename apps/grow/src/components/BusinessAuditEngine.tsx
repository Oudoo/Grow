"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import {
  ChevronRight, ArrowRight, ShieldCheck, Loader2, Boxes, Landmark, Users,
  Headphones, BarChart3, Shield, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  AUDIT_DIMENSIONS, MAX_SCORE_PER_DIMENSION, TOTAL_QUESTIONS, tierForScore,
} from "@/data/auditFramework";
import { submitAuditForm } from "@/app/audit/actions";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Boxes, Landmark, Users, Headphones, BarChart3, Shield,
};

// Flatten all questions, remembering which dimension each belongs to.
const FLAT = AUDIT_DIMENSIONS.flatMap((d) =>
  d.questions.map((q) => ({ dimensionId: d.id, dimensionLabel: d.label, icon: d.icon, question: q })),
);

export function BusinessAuditEngine() {
  // step: 0..N-1 questions, N = lead capture, N+1 = results
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const LEAD_STEP = FLAT.length;
  const RESULT_STEP = FLAT.length + 1;

  function handleAnswer(dimensionId: string, score: number) {
    setAnswers((prev) => ({
      ...prev,
      [dimensionId]: [...(prev[dimensionId] ?? []), score],
    }));
    setTimeout(() => setStep((s) => s + 1), 300);
  }

  // Per-dimension normalised scores (0-100)
  const dimensionScores = AUDIT_DIMENSIONS.map((d) => {
    const raw = (answers[d.id] ?? []).reduce((a, b) => a + b, 0);
    const percent = Math.round((raw / MAX_SCORE_PER_DIMENSION) * 100);
    return { ...d, raw, percent };
  });

  const overall = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.percent, 0) / dimensionScores.length,
  );
  const tier = tierForScore(overall);

  // The two weakest dimensions drive the sales recommendations.
  const gaps = [...dimensionScores].sort((a, b) => a.percent - b.percent).slice(0, 2);

  const radarData = dimensionScores.map((d) => ({ dimension: d.label.split(" ")[0], score: d.percent }));

  async function handleLeadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const breakdown = dimensionScores.map((d) => `  • ${d.label}: ${d.percent}%`).join("\n");
    formData.set(
      "message",
      `[DIGITAL MATURITY AUDIT]\nOverall: ${overall}% (${tier.label})\n${breakdown}\nTop gaps: ${gaps.map((g) => g.label).join(", ")}`,
    );
    formData.set("source", "Audit");
    // Lower maturity = greater need = hotter lead.
    formData.set("priority", overall < 50 ? "HOT" : overall < 70 ? "WARM" : "MEDIUM");

    try {
      const res = await submitAuditForm(formData);
      if (!res?.success) {
        setError(res?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      // Lead is captured in the CRM by submitAuditForm above. No external
      // WhatsApp/Twilio API call — sales reviews new leads in the admin CRM.
      setStep(RESULT_STEP);
    } catch {
      setError("We couldn't reach our servers. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.min(step, LEAD_STEP) / LEAD_STEP;

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      {/* Progress */}
      {step <= LEAD_STEP && (
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate font-bold uppercase tracking-wider mb-2">
            <span>Digital Maturity Assessment</span>
            <span>
              {step < LEAD_STEP ? `Question ${step + 1} of ${TOTAL_QUESTIONS}` : "Final step"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-fg/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan to-amethyst"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Questions */}
        {step < LEAD_STEP && (() => {
          const item = FLAT[step];
          const Icon = ICONS[item.icon] ?? BarChart3;
          return (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-obsidian/80 backdrop-blur-xl border border-fg/10 rounded-2xl p-8 md:p-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan/10 rounded-full flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-cyan" />
                </div>
                <span className="text-xs font-bold text-slate uppercase tracking-wider">{item.dimensionLabel}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-platinum mb-8 leading-tight">
                {item.question.title}
              </h2>
              <div className="space-y-3">
                {item.question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(item.dimensionId, opt.score)}
                    className="w-full p-4 rounded-xl border border-fg/10 bg-void/50 hover:bg-cyan/10 hover:border-cyan/30 text-left transition-all group flex items-center justify-between"
                  >
                    <span className="font-medium text-platinum group-hover:text-cyan transition-colors">{opt.text}</span>
                    <ChevronRight className="w-5 h-5 text-slate group-hover:text-cyan transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* Lead capture */}
        {step === LEAD_STEP && (
          <motion.div
            key="lead"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-obsidian/80 backdrop-blur-xl border border-cyan/20 rounded-2xl p-8 md:p-12 shadow-[0_0_50px_rgba(79,70,229,0.1)] text-center"
          >
            <ShieldCheck className="w-12 h-12 text-cyan mx-auto mb-6" />
            <h2 className="text-3xl font-heading font-bold text-platinum mb-3 text-glow">Your audit is ready</h2>
            <p className="text-slate mb-8 max-w-md mx-auto">
              We&apos;ve scored your organisation across {AUDIT_DIMENSIONS.length} dimensions. Enter your details to reveal your maturity report and tailored roadmap.
            </p>

            <form onSubmit={handleLeadSubmit} className="space-y-4 max-w-sm mx-auto text-left">
              <input name="name" required placeholder="Full Name" className="w-full bg-void border border-fg/10 rounded-xl px-4 py-3 text-platinum placeholder-slate/50 focus:outline-none focus:border-cyan transition-colors" />
              <input name="company" required placeholder="Company Name" className="w-full bg-void border border-fg/10 rounded-xl px-4 py-3 text-platinum placeholder-slate/50 focus:outline-none focus:border-cyan transition-colors" />
              <input name="email" type="email" required placeholder="Work Email" className="w-full bg-void border border-fg/10 rounded-xl px-4 py-3 text-platinum placeholder-slate/50 focus:outline-none focus:border-cyan transition-colors" />
              {error && (
                <p className="text-sm text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</p>
              )}
              <button type="submit" disabled={loading} className="w-full py-4 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 transition-all shadow-lg hover:shadow-cyan/20 disabled:opacity-50 flex justify-center items-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing…</> : <>Reveal My Results <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </motion.div>
        )}

        {/* Results */}
        {step === RESULT_STEP && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-obsidian/90 backdrop-blur-2xl border border-amethyst/30 rounded-2xl p-8 md:p-10"
          >
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-amethyst/10 border border-amethyst/20 text-amethyst text-sm font-bold tracking-wider uppercase mb-4">
                {tier.label} Maturity
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-platinum mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-amethyst">{overall}%</span>
              </h2>
              <p className="text-slate max-w-lg mx-auto leading-relaxed">{tier.blurb}</p>
            </div>

            {/* Radar chart */}
            <div className="h-72 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="score" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-dimension bars */}
            <div className="space-y-3 mb-8">
              {dimensionScores.map((d) => (
                <div key={d.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-platinum font-medium">{d.label}</span>
                    <span className="text-slate font-bold">{d.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-void rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.percent}%`, background: tierForScore(d.percent).color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Gap analysis / recommendations — the sales hook */}
            <div className="bg-void/50 border border-fg/10 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-platinum mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amethyst" /> Your biggest opportunities
              </h3>
              <div className="space-y-4">
                {gaps.map((g) => (
                  <div key={g.id}>
                    <p className="text-sm text-slate mb-2">
                      <strong className="text-platinum">{g.label}</strong> scored {g.percent}% — recommended Grow modules:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {g.recommends.map((p) => (
                        <Link key={p.slug} href={`/products/${p.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan/10 text-cyan border border-cyan/20 text-sm font-medium hover:bg-cyan hover:text-void transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {p.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-slate text-sm mb-6">
              A senior Grow architect has been notified and will email your full gap analysis and implementation roadmap within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products" className="inline-flex justify-center px-8 py-3 bg-cyan text-void font-bold rounded-full hover:bg-cyan/90 transition-colors">
                Explore the Ecosystem
              </Link>
              <Link href="/" className="inline-flex justify-center px-8 py-3 bg-fg/5 hover:bg-fg/10 border border-fg/10 rounded-full text-platinum font-bold transition-colors">
                Return Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
