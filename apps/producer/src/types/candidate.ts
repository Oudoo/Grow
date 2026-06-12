export type CandidateStatus =
  | "pending"
  | "scoring"
  | "passed"
  | "rejected"
  | "offer_sent"
  | "hired";

export interface Candidate {
  id: string;
  vacancyId: string;
  name: string;
  email: string;
  phone: string | null;
  yearsExperience: number | null;
  expectedSalary: number | null;
  rawCv: string;
  portfolioUrl: string | null;
  portfolioTitle: string | null;
  portfolioImage: string | null;
  portfolioDesc: string | null;
  compositeScore: number | null;
  status: CandidateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedCV {
  name: string;
  email: string;
  phone: string | null;
  yearsExperience: number | null;
  expectedSalary: number | null;
  hardSkills: string[];
  softSkills: string[];
  rawContent: string;
}

export interface PortfolioMeta {
  title: string | null;
  image: string | null;
  description: string | null;
  url: string;
}
