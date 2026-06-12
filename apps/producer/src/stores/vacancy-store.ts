"use client";

import { create } from "zustand";
import type { Vacancy } from "@/types/vacancy";

interface VacancyState {
  vacancies: Vacancy[];
  selectedVacancy: Vacancy | null;
  isLoading: boolean;
  isModalOpen: boolean;

  setVacancies: (vacancies: Vacancy[]) => void;
  setSelectedVacancy: (vacancy: Vacancy | null) => void;
  addVacancy: (vacancy: Vacancy) => void;
  updateVacancy: (id: string, updates: Partial<Vacancy>) => void;
  setLoading: (loading: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useVacancyStore = create<VacancyState>((set) => ({
  vacancies: [],
  selectedVacancy: null,
  isLoading: false,
  isModalOpen: false,

  setVacancies: (vacancies) => set({ vacancies }),
  setSelectedVacancy: (vacancy) => set({ selectedVacancy: vacancy }),
  addVacancy: (vacancy) =>
    set((state) => ({ vacancies: [vacancy, ...state.vacancies] })),
  updateVacancy: (id, updates) =>
    set((state) => ({
      vacancies: state.vacancies.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
