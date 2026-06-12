"use client";

import { create } from "zustand";
import type { Candidate } from "@/types/candidate";

interface CandidateState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  isLoading: boolean;
  isModalOpen: boolean;

  setCandidates: (candidates: Candidate[]) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  setLoading: (loading: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidates: [],
  selectedCandidate: null,
  isLoading: false,
  isModalOpen: false,

  setCandidates: (candidates) => set({ candidates }),
  setSelectedCandidate: (candidate) =>
    set({ selectedCandidate: candidate }),
  addCandidate: (candidate) =>
    set((state) => ({ candidates: [candidate, ...state.candidates] })),
  updateCandidate: (id, updates) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
