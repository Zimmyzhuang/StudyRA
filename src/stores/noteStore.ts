import { create } from "zustand";
import { db } from "@/lib/database";
import type { Note } from "@/lib/types";

interface NoteState {
  notes: Note[];
  activeNote: Note | null;
  loading: boolean;

  fetchNotes: (subjectId: string) => Promise<void>;
  fetchAllNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (subjectId: string, title?: string) => Promise<Note>;
  updateNote: (
    id: string,
    title: string,
    contentJson: string,
    plainText: string
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setActiveNote: (note: Note | null) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  activeNote: null,
  loading: false,

  fetchNotes: async (subjectId) => {
    set({ loading: true });
    try {
      const notes = await db.notes.getBySubject(subjectId);
      set({ notes, loading: false });
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      set({ loading: false });
    }
  },

  fetchAllNotes: async () => {
    set({ loading: true });
    try {
      const notes = await db.notes.getAll();
      set({ notes, loading: false });
    } catch (err) {
      console.error("Failed to fetch all notes:", err);
      set({ loading: false });
    }
  },

  fetchNote: async (id) => {
    try {
      const note = await db.notes.get(id);
      set({ activeNote: note });
    } catch (err) {
      console.error("Failed to fetch note:", err);
    }
  },

  createNote: async (subjectId, title = "Untitled") => {
    const note = await db.notes.create(subjectId, title);
    set({ notes: [note, ...get().notes], activeNote: note });
    return note;
  },

  updateNote: async (id, title, contentJson, plainText) => {
    const updated = await db.notes.update(id, title, contentJson, plainText);
    set({
      notes: get().notes.map((n) => (n.id === id ? updated : n)),
      activeNote: get().activeNote?.id === id ? updated : get().activeNote,
    });
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    const remaining = get().notes.filter((n) => n.id !== id);
    set({
      notes: remaining,
      activeNote: get().activeNote?.id === id ? null : get().activeNote,
    });
  },

  setActiveNote: (note) => set({ activeNote: note }),
}));
