"use client";

import { BusinessAuditEngine } from "@/components/BusinessAuditEngine";

export default function AuditQuizPage() {
  return (
    <div className="min-h-screen bg-void pt-32 pb-20 px-4 relative flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan/10 via-void to-void pointer-events-none" />
      <BusinessAuditEngine />
    </div>
  );
}
