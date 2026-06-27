"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Lock, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginAction(email, password);
      if (result.success) {
        router.push(result.landing || "/admin");
        return;
      }
      setError(result.error || "Invalid email or password.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan/5 via-void to-void" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-fg/5 border border-fg/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-cyan" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-platinum">Grow Core Access</h1>
          <p className="text-slate text-sm mt-2">Sign in with your account to access the command center.</p>
        </div>

        <Card className="p-8 border-fg/10 bg-obsidian/80 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">
                email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate/50" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  name="email"
                  className="block w-full pl-10 pr-3 py-3 border border-fg/10 rounded-xl leading-5 bg-void text-platinum placeholder-slate/50 focus:outline-none focus:ring-1 focus:ring-cyan focus:border-cyan transition-colors sm:text-sm"
                  placeholder="you@grow.agency"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">
                password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate/50" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  name="password"
                  className="block w-full pl-10 pr-3 py-3 border border-fg/10 rounded-xl leading-5 bg-void text-platinum placeholder-slate/50 focus:outline-none focus:ring-1 focus:ring-cyan focus:border-cyan transition-colors sm:text-sm"
                  placeholder="Enter your password..."
                  required
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-void bg-cyan hover:bg-cyan/90 focus:outline-none transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
