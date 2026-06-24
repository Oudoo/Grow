import { SystemConsole } from "../systems/SystemConsole";
import { probeSystem } from "../systems/health";

export const dynamic = "force-dynamic";

export default async function GroweesProducerPage() {
  const url = process.env.GROWEES_PRODUCER_URL || "http://localhost:3040";
  const status = await probeSystem(url);

  return (
    <SystemConsole
      name="Growees Producer"
      tagline="Deterministic recruitment engine — competency-based scoring, multi-rater scorecards, CV parsing, and automated pipeline management for building Grow teams."
      url={url}
      status={status}
      capabilities={[
        "Vacancy Blueprints (.md)",
        "CV Parsing",
        "Portfolio Scraping",
        "Weighted Scorecards",
        "Variance Checks",
        "Offer Generation",
        "Acceptance Thresholds",
      ]}
    />
  );
}
