export interface Score {
  id: string;
  scorecardId: string;
  competencyId: string;
  value: number; // 1–5
  notes: string | null;
}

export interface Scorecard {
  id: string;
  candidateId: string;
  managerName: string;
  submittedAt: string;
  scores: Score[];
}

export interface VarianceResult {
  competencyId: string;
  competencyName: string;
  scores: { manager: string; value: number }[];
  maxVariance: number;
  requiresConsensus: boolean;
}

export interface ConsensusInput {
  competencyId: string;
  consensusValue: number; // 1–5
  consensusNotes: string;
}

export interface ScorecardSubmission {
  candidateId: string;
  managerName: string;
  scores: {
    competencyId: string;
    value: number;
    notes: string;
  }[];
}
