export type CompetencyCategory = "hard" | "soft";

export interface Competency {
  id: string;
  vacancyId: string;
  name: string;
  category: CompetencyCategory;
  weight: number; // 0.0 – 1.0 (e.g., 0.25 = 25%)
  order: number;
}

export type VacancyStatus = "open" | "closed" | "filled";

export interface Vacancy {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  salaryBudgetMin: number | null;
  salaryBudgetMax: number | null;
  acceptanceScore: number;
  jobPostingHtml: string;
  rawBlueprint: string;
  status: VacancyStatus;
  createdAt: string;
  updatedAt: string;
  competencies: Competency[];
  _count?: { candidates: number };
}

export interface ParsedBlueprint {
  title: string;
  department: string | null;
  location: string | null;
  salaryBudgetMin: number | null;
  salaryBudgetMax: number | null;
  acceptanceScore: number;
  jobPostingMarkdown: string;
  jobPostingHtml: string;
  competencies: Omit<Competency, "id" | "vacancyId">[];
}
