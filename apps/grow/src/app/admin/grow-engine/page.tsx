import { SystemConsole } from "../systems/SystemConsole";
import { probeSystem } from "../systems/health";

export const dynamic = "force-dynamic";

export default async function GrowEnginePage() {
  const url = process.env.GROW_ENGINE_URL || "http://localhost:3030";
  const status = await probeSystem(url);

  return (
    <SystemConsole
      name="Grow Engine"
      tagline="Multi-tenant Growth Intelligence Platform — collects, validates, analyzes, explains, and builds execution plans from marketing and operational data."
      url={url}
      status={status}
      capabilities={[
        "Verifiable Data Layer",
        "Integration Connectors (Meta, GA4, Google Ads, TikTok, LinkedIn, CRM)",
        "Forecasting & Seasonality",
        "AI Recommendation Verification",
        "Meeting Intelligence",
        "SOW & DMAIC Generators",
        "Client Portal",
        "Public API",
      ]}
    />
  );
}
