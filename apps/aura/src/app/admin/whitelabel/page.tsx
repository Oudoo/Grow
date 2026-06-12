import { prisma } from "@/lib/db";
import { Paintbrush } from "lucide-react";
import { WhitelabelClient } from "./WhitelabelClient";

export const dynamic = "force-dynamic";

const QUESTIONNAIRE = [
  {
    section: "Deal Status",
    questions: [
      "Is this a demo or a finalized deal / implementation?",
      "What is the customer's company name and industry?",
      "What modules / products are they interested in?",
    ],
  },
  {
    section: "Branding",
    questions: [
      "What is the primary brand color? (hex code preferred)",
      "What is the secondary / accent brand color?",
      "Do they have an existing logo? (provide URL or upload)",
      "What heading font do they use? (or should we suggest one?)",
      "What body font do they use?",
    ],
  },
  {
    section: "Company Details",
    questions: [
      "What is the company's official tagline or value proposition?",
      "What is the primary contact email for the system?",
      "What is the primary contact phone number?",
      "What is the company address?",
    ],
  },
  {
    section: "Customization Scope",
    questions: [
      "Which sections of the admin dashboard should they have access to?",
      "Are there any language requirements beyond English? (e.g., Arabic RTL)",
      "Do they need a custom domain, or will a subdomain work?",
      "Are there any specific integrations needed? (e.g., WhatsApp, Twilio, payment gateway)",
      "What is the target go-live / demo date?",
    ],
  },
];

export default async function WhitelabelPage() {
  let config = null;
  try {
    config = await prisma.tenantConfig.findUnique({ where: { id: "default" } });
  } catch {
    // table not yet migrated
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-platinum mb-2 flex items-center gap-3">
          <Paintbrush className="w-8 h-8 text-cyan" />
          White-Label Configuration
        </h1>
        <p className="text-slate">Customize the platform branding for a customer. Use the questionnaire below to gather everything you need before filling in the form.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Questionnaire */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-platinum">Implementation Questionnaire</h2>
          <p className="text-sm text-slate">When a customer asks you to sell or demo this platform, answer these questions first so the configuration is complete.</p>
          {QUESTIONNAIRE.map((section) => (
            <div key={section.section} className="bg-obsidian border border-fg/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-cyan uppercase tracking-wider mb-3">{section.section}</h3>
              <ol className="space-y-2">
                {section.questions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate">
                    <span className="text-slate/40 tabular-nums shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Config form */}
        <div className="lg:col-span-3">
          <WhitelabelClient config={config} />
        </div>
      </div>
    </div>
  );
}
