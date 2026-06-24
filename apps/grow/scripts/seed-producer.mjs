import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database with impressive demo data...');

  // Clean existing data
  await prisma.offer.deleteMany();
  await prisma.score.deleteMany();
  await prisma.scorecard.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.vacancy.deleteMany();

  // ----------------------------------------------------
  // VACANCY 1: Senior Frontend Engineer
  // ----------------------------------------------------
  const vac1 = await prisma.vacancy.create({
    data: {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote (US/EU)',
      acceptanceScore: 4.0,
      salaryBudgetMin: 130000,
      salaryBudgetMax: 160000,
      status: 'active',
      jobPostingHtml: '<h2>1. The Job Posting</h2><p>We are looking for a Senior Frontend Engineer...</p>',
      rawBlueprint: '# Senior Frontend Engineer\nDummy blueprint content',
      competencies: {
        create: [
          { name: 'React & Next.js Architecture', category: 'hard', weight: 0.3, order: 1 },
          { name: 'State Management (Zustand)', category: 'hard', weight: 0.2, order: 2 },
          { name: 'Mentorship & Leadership', category: 'soft', weight: 0.25, order: 3 },
          { name: 'Communication', category: 'soft', weight: 0.25, order: 4 },
        ]
      }
    },
    include: { competencies: true }
  });

  // Candidate 1: Hired (Awesome)
  const c1 = await prisma.candidate.create({
    data: {
      vacancyId: vac1.id,
      name: 'Elena Rodriguez',
      email: 'elena.rodriguez@example.com',
      phone: '+1 555-0198',
      yearsExperience: 8,
      expectedSalary: 150000,
      rawCv: '---\nname: Elena\n---\nDummy CV content',
      status: 'hired',
      compositeScore: 4.8,
      portfolioUrl: 'https://github.com/elenarodriguez',
      portfolioTitle: 'Elena | Frontend Architect',
    }
  });

  // Offer for Elena
  await prisma.offer.create({
    data: {
      candidateId: c1.id,
      offeredSalary: 155000,
      firstWorkingDate: '2026-07-01',
      contractType: 'full-time',
      itEquipment: 'MacBook Pro 16" M3 Max',
      status: 'accepted'
    }
  });

  // Candidate 2: Scoring Phase (Shows Variance)
  const c2 = await prisma.candidate.create({
    data: {
      vacancyId: vac1.id,
      name: 'James Chen',
      email: 'j.chen.dev@example.com',
      yearsExperience: 6,
      expectedSalary: 145000,
      rawCv: '---\nname: James\n---\nDummy CV content',
      status: 'scoring',
    }
  });

  // Create Scorecards for James to trigger variance
  const c2sc1 = await prisma.scorecard.create({
    data: { candidateId: c2.id, managerName: 'Sarah (CTO)' }
  });
  await prisma.score.createMany({
    data: [
      { scorecardId: c2sc1.id, competencyId: vac1.competencies[0].id, value: 5, notes: 'Brilliant understanding of SSR.' },
      { scorecardId: c2sc1.id, competencyId: vac1.competencies[1].id, value: 4, notes: 'Good grasp of Zustand.' },
      { scorecardId: c2sc1.id, competencyId: vac1.competencies[2].id, value: 4, notes: '' },
      { scorecardId: c2sc1.id, competencyId: vac1.competencies[3].id, value: 5, notes: '' },
    ]
  });

  const c2sc2 = await prisma.scorecard.create({
    data: { candidateId: c2.id, managerName: 'Mike (Engineering Manager)' }
  });
  await prisma.score.createMany({
    data: [
      { scorecardId: c2sc2.id, competencyId: vac1.competencies[0].id, value: 2, notes: 'Struggled heavily with App Router questions.' }, // <-- VARIANCE 5 vs 2
      { scorecardId: c2sc2.id, competencyId: vac1.competencies[1].id, value: 4, notes: '' },
      { scorecardId: c2sc2.id, competencyId: vac1.competencies[2].id, value: 3, notes: '' },
      { scorecardId: c2sc2.id, competencyId: vac1.competencies[3].id, value: 3, notes: '' },
    ]
  });

  // Candidate 3: Pending
  await prisma.candidate.create({
    data: {
      vacancyId: vac1.id,
      name: 'Anita Patel',
      email: 'anita.p@example.com',
      yearsExperience: 5,
      expectedSalary: 135000,
      rawCv: '---\nname: Anita\n---\nDummy CV content',
      status: 'pending',
    }
  });


  // ----------------------------------------------------
  // VACANCY 2: Head of Growth
  // ----------------------------------------------------
  const vac2 = await prisma.vacancy.create({
    data: {
      title: 'Head of Growth',
      department: 'Marketing',
      location: 'New York, NY',
      acceptanceScore: 4.2,
      salaryBudgetMin: 150000,
      salaryBudgetMax: 180000,
      status: 'active',
      jobPostingHtml: '<h2>1. The Job Posting</h2><p>Looking for an experienced growth leader...</p>',
      rawBlueprint: '# Head of Growth\nDummy blueprint content',
      competencies: {
        create: [
          { name: 'Data-Driven Marketing', category: 'hard', weight: 0.4, order: 1 },
          { name: 'Team Building', category: 'soft', weight: 0.3, order: 2 },
          { name: 'Strategic Vision', category: 'soft', weight: 0.3, order: 3 },
        ]
      }
    },
    include: { competencies: true }
  });

  // Candidate 1: Passed, ready for offer (Over budget scenario)
  await prisma.candidate.create({
    data: {
      vacancyId: vac2.id,
      name: 'David Kim',
      email: 'dkim.growth@example.com',
      yearsExperience: 12,
      expectedSalary: 210000, // OVER BUDGET!
      rawCv: '---\nname: David\n---\nDummy CV content',
      status: 'passed',
      compositeScore: 4.6,
    }
  });


  console.log('Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
