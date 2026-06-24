"use client";

import { useState } from "react";
import { Footer } from "@/components/Footer";
import { LifeBuoy, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { submitPublicTicketAction } from "./actions";
import { Card } from "@/components/ui/Card";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      await submitPublicTicketAction(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center bg-void min-h-screen pt-24">
      <div className="container mx-auto px-4 max-w-3xl pb-24 flex-1">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-cyan/10 rounded-2xl mb-4">
            <LifeBuoy className="w-8 h-8 text-cyan" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-platinum mb-4">Grow Client Support</h1>
          <p className="text-slate text-lg">Submit a ticket to our engineering and support team.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-cyan/5 blur-3xl -z-10 rounded-full" />
          
          <Card className="p-8 md:p-10 bg-obsidian/80 backdrop-blur-xl border-cyan/20">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-platinum">Ticket Submitted Successfully</h3>
                <p className="text-slate max-w-md mx-auto">
                  Our team has received your request and will begin investigating immediately. You will be contacted shortly with an update.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 px-6 py-2 bg-fg/10 text-platinum rounded-lg hover:bg-fg/20 transition-colors"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start text-red-400">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate uppercase tracking-wider">Your Name / Organization</label>
                    <input 
                      name="clientName" 
                      required 
                      className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum focus:border-cyan outline-none transition-colors"
                      placeholder="e.g. John Doe - TechCorp"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate uppercase tracking-wider">Priority Level</label>
                    <select 
                      name="priority" 
                      className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum focus:border-cyan outline-none transition-colors appearance-none"
                    >
                      <option value="LOW">Low - General inquiry</option>
                      <option value="MEDIUM">Medium - Non-critical issue</option>
                      <option value="HIGH">High - Important feature broken</option>
                      <option value="URGENT">Urgent - System down / Critical block</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate uppercase tracking-wider">Issue Subject</label>
                  <input 
                    name="title" 
                    required 
                    className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum focus:border-cyan outline-none transition-colors"
                    placeholder="Brief summary of the issue"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate uppercase tracking-wider">Detailed Description</label>
                  <textarea 
                    name="description" 
                    required 
                    rows={6}
                    className="w-full px-4 py-3 bg-void border border-fg/10 rounded-xl text-platinum focus:border-cyan outline-none transition-colors resize-none"
                    placeholder="Please provide as much detail as possible to help our engineers diagnose the issue..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center px-8 py-4 bg-cyan text-void font-bold rounded-xl hover:bg-cyan/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    "Submitting Ticket..."
                  ) : (
                    <>
                      Submit Ticket to Engineering <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
