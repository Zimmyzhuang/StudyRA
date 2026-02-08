import { create } from "zustand";
import { db } from "@/lib/database";
import type { Subject } from "@/lib/types";

interface SubjectState {
  subjects: Subject[];
  loading: boolean;

  fetchSubjects: () => Promise<void>;
  createSubject: (name: string, colorHex: string) => Promise<Subject>;
  updateSubject: (
    id: string,
    name: string,
    colorHex: string
  ) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
}

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  loading: false,

  fetchSubjects: async () => {
    set({ loading: true });
    try {
      const subjects = await db.subjects.getAll();
      set({ subjects, loading: false });
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      set({ loading: false });
    }
  },

  createSubject: async (name, colorHex) => {
    const subject = await db.subjects.create(name, colorHex);
    set({ subjects: [...get().subjects, subject] });
    return subject;
  },

  updateSubject: async (id, name, colorHex) => {
    const updated = await db.subjects.update(id, name, colorHex);
    set({
      subjects: get().subjects.map((s) => (s.id === id ? updated : s)),
    });
  },

  deleteSubject: async (id) => {
    await db.subjects.delete(id);
    set({ subjects: get().subjects.filter((s) => s.id !== id) });
  },
}));
