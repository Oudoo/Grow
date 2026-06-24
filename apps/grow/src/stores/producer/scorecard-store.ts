"use client";

import { create } from "zustand";
import type { Scorecard, VarianceResult, ConsensusInput } from "@/types/producer/scorecard";

interface ScorecardState {
  scorecards: Scorecard[];
  varianceResults: VarianceResult[];
  consensusInputs: ConsensusInput[];
  isSubmitting: boolean;

  setScorecards: (scorecards: Scorecard[]) => void;
  addScorecard: (scorecard: Scorecard) => void;
  setVarianceResults: (results: VarianceResult[]) => void;
  setConsensusInput: (input: ConsensusInput) => void;
  setSubmitting: (submitting: boolean) => void;
  clearState: () => void;
}

export const useScorecardStore = create<ScorecardState>((set) => ({
  scorecards: [],
  varianceResults: [],
  consensusInputs: [],
  isSubmitting: false,

  setScorecards: (scorecards) => set({ scorecards }),
  addScorecard: (scorecard) =>
    set((state) => ({ scorecards: [...state.scorecards, scorecard] })),
  setVarianceResults: (varianceResults) => set({ varianceResults }),
  setConsensusInput: (input) =>
    set((state) => ({
      consensusInputs: [
        ...state.consensusInputs.filter(
          (c) => c.competencyId !== input.competencyId
        ),
        input,
      ],
    })),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  clearState: () =>
    set({
      scorecards: [],
      varianceResults: [],
      consensusInputs: [],
      isSubmitting: false,
    }),
}));
