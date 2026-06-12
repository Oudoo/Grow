import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const day = (offset) => new Date(Date.now() + offset * 86400000);

const leads = [
  { id: 'demo-lead-1', name: 'Layla Mansour', email: 'layla@nilewear.com', company: 'NileWear Apparel', message: 'CAC on Meta doubled in two quarters. We need a full performance audit and a restructured funnel.', status: 'in-progress', called: 'yes', priority: 'HOT', dealValue: 48000, source: 'Website', nextFollowUp: day(0), notes: 'Decision maker. Wants Growth Intelligence demo — book Engine walkthrough.' },
  { id: 'demo-lead-2', name: 'Omar El-Sayed', email: 'omar@deltalogistics.co', company: 'Delta Logistics', message: 'Marketing and operations data live in 9 tools. Looking for the integrated infrastructure offer.', status: 'reviewed', called: 'yes', priority: 'HOT', dealValue: 120000, source: 'Referral', nextFollowUp: day(1), notes: 'Upsell candidate: full Business Solutions bundle (TMS + CRM + Finance).' },
  { id: 'demo-lead-3', name: 'Sarah Whitfield', email: 's.whitfield@auroragroup.io', company: 'Aurora Group', message: 'Need a content engine that publishes weekly across 4 markets with attribution.', status: 'new', called: 'no', priority: 'WARM', dealValue: 36000, source: 'LinkedIn', nextFollowUp: day(2), notes: null },
  { id: 'demo-lead-4', name: 'Khaled Nassar', email: 'khaled@gulfestates.ae', company: 'Gulf Estates', message: 'Requesting the growth audit. Main bottleneck: no visibility into channel ROI.', status: 'new', called: 'no', priority: 'MEDIUM', dealValue: 24000, source: 'WhatsApp', nextFollowUp: day(3), notes: null },
  { id: 'demo-lead-5', name: 'Mona Adel', email: 'mona@cairobites.com', company: 'Cairo Bites', message: 'Brand refresh + performance media for delivery app launch in Q3.', status: 'closed', called: 'yes', priority: 'WARM', dealValue: 60000, source: 'Direct', nextFollowUp: null, notes: 'WON — signed integrated retainer. Kickoff scheduled.' },
  { id: 'demo-lead-6', name: 'James Okafor', email: 'j.okafor@lagostech.ng', company: 'LagosTech', message: 'Exploring the Growees Producer for our 40-role hiring sprint.', status: 'reviewed', called: 'no', priority: 'COLD', dealValue: 15000, source: 'Website', nextFollowUp: day(5), notes: 'Interested in recruitment system only — nurture for ecosystem upsell.' },
];

const invoices = [
  { invoiceNo: 'GROW-2026-0041', clientName: 'Cairo Bites', amount: 20000, status: 'PAID', issueDate: day(-28), dueDate: day(-14), notes: 'Integrated retainer — month 1 of 3.' },
  { invoiceNo: 'GROW-2026-0042', clientName: 'Delta Logistics', amount: 45000, status: 'SENT', issueDate: day(-7), dueDate: day(7), notes: 'Phase 1: Diagnostic + growth architecture.' },
  { invoiceNo: 'GROW-2026-0043', clientName: 'Aurora Group', amount: 12000, status: 'OVERDUE', issueDate: day(-40), dueDate: day(-10), notes: 'Content engine pilot — chase payment.' },
  { invoiceNo: 'GROW-2026-0044', clientName: 'NileWear Apparel', amount: 16000, status: 'DRAFT', issueDate: day(0), dueDate: day(14), notes: 'Performance media audit + restructure.' },
  { invoiceNo: 'GROW-2026-0045', clientName: 'Gulf Estates', amount: 8000, status: 'PAID', issueDate: day(-18), dueDate: day(-4), notes: 'Growth audit engagement.' },
];

const tickets = [
  { id: 'demo-ticket-1', title: 'Dashboard access for new CMO', description: 'Cairo Bites onboarded a CMO who needs client-portal access to the Growth Intelligence dashboards.', clientName: 'Cairo Bites', status: 'OPEN', priority: 'HIGH' },
  { id: 'demo-ticket-2', title: 'GA4 connector re-authentication', description: 'Aurora Group GA4 OAuth token expired; metrics sync paused since Tuesday.', clientName: 'Aurora Group', status: 'IN_PROGRESS', priority: 'URGENT' },
  { id: 'demo-ticket-3', title: 'Invoice copy request', description: 'Gulf Estates finance team requests a stamped copy of GROW-2026-0045 for their records.', clientName: 'Gulf Estates', status: 'RESOLVED', priority: 'LOW' },
  { id: 'demo-ticket-4', title: 'Creative asset turnaround', description: 'Delta Logistics requests revised ad creatives for the Ramadan campaign flight.', clientName: 'Delta Logistics', status: 'OPEN', priority: 'MEDIUM' },
];

async function main() {
  for (const l of leads) {
    const { id, ...data } = l;
    await p.submission.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  console.log('CRM leads:', await p.submission.count());

  for (const inv of invoices) {
    await p.invoice.upsert({ where: { invoiceNo: inv.invoiceNo }, update: inv, create: inv });
  }
  console.log('Invoices:', await p.invoice.count());

  for (const t of tickets) {
    const { id, ...data } = t;
    await p.ticket.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  console.log('Tickets:', await p.ticket.count());

  await p.tenantConfig.upsert({
    where: { id: 'default' },
    update: { companyName: 'GROW', tagline: 'Integrated Creative & Enterprise Infrastructure Operating as One.', primaryColor: '#4F46E5', secondaryColor: '#4338CA', fontHeading: 'Neue Montreal / Archivo', fontBody: 'SF Pro / Roboto Mono', contactEmail: 'admin@grow.agency' },
    create: { id: 'default', companyName: 'GROW', tagline: 'Integrated Creative & Enterprise Infrastructure Operating as One.', primaryColor: '#4F46E5', secondaryColor: '#4338CA', fontHeading: 'Neue Montreal / Archivo', fontBody: 'SF Pro / Roboto Mono', contactEmail: 'admin@grow.agency' },
  });
  console.log('TenantConfig: GROW');

  // stale rebrand leftovers, if any
  await p.product.deleteMany({ where: { slug: 'aura-chatbot' } });

  const projects = await p.project.findMany({ select: { id: true, title: true } });
  console.log('Projects:', projects.map(x => x.title).join(' | '));
}
main().finally(() => p.$disconnect());
