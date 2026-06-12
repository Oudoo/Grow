/**
 * Grow Digital Maturity Assessment
 * -------------------------------------------------------------
 * A real, scored business audit modelled on the widely used
 * "Digital Maturity Model" (the same framework Deloitte, MIT/Capgemini
 * and Google's Digital Maturity Benchmark popularised). Each dimension
 * maps to an Grow product suite, so a low score in a dimension produces a
 * concrete recommendation — turning the audit into a sales engine.
 *
 * Scoring: every option carries 1–4 points. A dimension's raw score is the
 * sum of its answers; we normalise to a 0–100 percentage per dimension and
 * overall. Maturity tiers follow the classic four-stage model.
 */

export type AuditOption = { text: string; score: number };

export type AuditQuestion = {
  id: string;
  title: string;
  options: AuditOption[];
};

export type AuditDimension = {
  id: string;
  /** Maps to a suite slug in src/data/ecosystem.ts */
  suiteSlug: string;
  label: string;
  icon: string; // lucide icon name
  questions: AuditQuestion[];
  /** Products to recommend when this dimension scores low */
  recommends: { name: string; slug: string }[];
};

export const AUDIT_DIMENSIONS: AuditDimension[] = [
  {
    id: "operations",
    suiteSlug: "operations-logistics",
    label: "Operations & Logistics",
    icon: "Boxes",
    questions: [
      {
        id: "ops-1",
        title: "How do you currently track inventory and operational data?",
        options: [
          { text: "Spreadsheets and manual entry", score: 1 },
          { text: "Disconnected legacy tools", score: 2 },
          { text: "A single ERP/inventory system", score: 3 },
          { text: "Real-time, fully integrated platform", score: 4 },
        ],
      },
      {
        id: "ops-2",
        title: "How optimised is your supply chain & fleet routing?",
        options: [
          { text: "Manual planning, no optimisation", score: 1 },
          { text: "Basic rules, lots of phone calls", score: 2 },
          { text: "Software-assisted scheduling", score: 3 },
          { text: "AI-driven routing & predictive maintenance", score: 4 },
        ],
      },
    ],
    recommends: [
      { name: "Supply Chain Management (SCM)", slug: "scm" },
      { name: "Inventory & Warehouse Management (WMS)", slug: "wms" },
    ],
  },
  {
    id: "finance",
    suiteSlug: "finance-erp",
    label: "Finance & ERP",
    icon: "Landmark",
    questions: [
      {
        id: "fin-1",
        title: "How quickly can you produce accurate financial reports?",
        options: [
          { text: "Weeks of manual consolidation", score: 1 },
          { text: "Days, exporting from many tools", score: 2 },
          { text: "Hours, automated with checks", score: 3 },
          { text: "Real-time live dashboards", score: 4 },
        ],
      },
      {
        id: "fin-2",
        title: "How are procurement and expense approvals handled?",
        options: [
          { text: "Email and paper, no controls", score: 1 },
          { text: "Shared sheets, manual sign-off", score: 2 },
          { text: "Workflow tool with some automation", score: 3 },
          { text: "Fully automated with spend controls", score: 4 },
        ],
      },
    ],
    recommends: [
      { name: "Finance Management System", slug: "finance" },
      { name: "Procurement & Expenses Management", slug: "procurement" },
    ],
  },
  {
    id: "people",
    suiteSlug: "hr-performance",
    label: "HR & People",
    icon: "Users",
    questions: [
      {
        id: "hr-1",
        title: "How do you run payroll and core HR operations?",
        options: [
          { text: "Manual calculations each cycle", score: 1 },
          { text: "Outsourced with back-and-forth", score: 2 },
          { text: "An HR system, partly automated", score: 3 },
          { text: "Automated compliance & self-service", score: 4 },
        ],
      },
      {
        id: "hr-2",
        title: "How do you track performance and upskilling?",
        options: [
          { text: "We don't, really", score: 1 },
          { text: "Annual reviews on paper", score: 2 },
          { text: "Digital reviews and goals", score: 3 },
          { text: "Continuous KPI tracking + LMS", score: 4 },
        ],
      },
    ],
    recommends: [
      { name: "Payroll System", slug: "payroll" },
      { name: "Performance Management System", slug: "performance" },
    ],
  },
  {
    id: "customer",
    suiteSlug: "customer-sales",
    label: "Customer & Sales",
    icon: "Headphones",
    questions: [
      {
        id: "cust-1",
        title: "How do you manage your sales pipeline & leads?",
        options: [
          { text: "Memory, notebooks, scattered chats", score: 1 },
          { text: "Spreadsheets per salesperson", score: 2 },
          { text: "A shared CRM", score: 3 },
          { text: "CRM with automation & intelligence", score: 4 },
        ],
      },
      {
        id: "cust-2",
        title: "How do customers get support?",
        options: [
          { text: "Personal phone/WhatsApp only", score: 1 },
          { text: "A shared inbox", score: 2 },
          { text: "A ticketing system", score: 3 },
          { text: "Omnichannel desk with SLAs", score: 4 },
        ],
      },
    ],
    recommends: [
      { name: "Customer Relationship Management (CRM)", slug: "crm" },
      { name: "Customer Support & Ticketing", slug: "ticketing" },
    ],
  },
  {
    id: "data",
    suiteSlug: "data-analytics",
    label: "Data & Analytics",
    icon: "BarChart3",
    questions: [
      {
        id: "data-1",
        title: "How is decision-making data surfaced to leadership?",
        options: [
          { text: "Gut feel, no central data", score: 1 },
          { text: "Manual monthly reports", score: 2 },
          { text: "Some BI dashboards", score: 3 },
          { text: "Real-time BI with forecasting", score: 4 },
        ],
      },
      {
        id: "data-2",
        title: "Where does your operational data live?",
        options: [
          { text: "Siloed across many apps", score: 1 },
          { text: "Partly centralised", score: 2 },
          { text: "A central database", score: 3 },
          { text: "A unified data warehouse/lake", score: 4 },
        ],
      },
    ],
    recommends: [
      { name: "Business Intelligence Dashboards", slug: "bi-dashboards" },
      { name: "Predictive / Forecast Analytics", slug: "predictive-analytics" },
    ],
  },
  {
    id: "technology",
    suiteSlug: "ai-transformation",
    label: "Technology, AI & Security",
    icon: "Shield",
    questions: [
      {
        id: "tech-1",
        title: "How would you describe your security posture?",
        options: [
          { text: "Basic antivirus & firewalls", score: 1 },
          { text: "VPNs and role-based access", score: 2 },
          { text: "SIEM and automated backups", score: 3 },
          { text: "Zero-trust, end-to-end encryption", score: 4 },
        ],
      },
      {
        id: "tech-2",
        title: "How far along is your AI adoption?",
        options: [
          { text: "No AI in use", score: 1 },
          { text: "Experimenting with chatbots", score: 2 },
          { text: "AI assisting a few workflows", score: 3 },
          { text: "Autonomous AI agents in production", score: 4 },
        ],
      },
    ],
    recommends: [
      { name: "Identity & Access Management (IAM)", slug: "iam" },
      { name: "Agents OS", slug: "agents-os" },
    ],
  },
];

export const MAX_SCORE_PER_DIMENSION = AUDIT_DIMENSIONS[0].questions.length * 4; // 8
export const TOTAL_QUESTIONS = AUDIT_DIMENSIONS.reduce((n, d) => n + d.questions.length, 0);

export type MaturityTier = {
  min: number; // inclusive lower bound, percentage
  label: string;
  blurb: string;
  color: string; // hex for charts
};

export const MATURITY_TIERS: MaturityTier[] = [
  { min: 0, label: "Reactive", blurb: "Mostly manual and ad-hoc. High risk, low visibility — the biggest opportunity for transformation.", color: "#F87171" },
  { min: 41, label: "Developing", blurb: "Tools exist but operate in silos. Data is fragmented and growth is capped by manual work.", color: "#FBBF24" },
  { min: 61, label: "Integrated", blurb: "Systems are connected and scaling. You're ahead of most — now it's about intelligence and automation.", color: "#22D3EE" },
  { min: 81, label: "Optimised", blurb: "Real-time, automated and data-driven. The focus shifts to AI-led optimisation and competitive moat.", color: "#34D399" },
];

export function tierForScore(percent: number): MaturityTier {
  return [...MATURITY_TIERS].reverse().find((t) => percent >= t.min) ?? MATURITY_TIERS[0];
}
