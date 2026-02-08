import { create } from "zustand";
import type { AppView } from "@/lib/types";

interface AppState {
  // ── Sidebar ──
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // ── Navigation ──
  activeView: AppView;
  setActiveView: (view: AppView) => void;

  // ── Selection ──
  activeSubjectId: string | null;
  activeNoteId: string | null;
  setActiveSubject: (id: string | null) => void;
  setActiveNote: (id: string | null) => void;

  // ── Command Palette ──
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // ── Focus Timer (placeholder) ──
  timerRunning: boolean;
  timerSeconds: number;
  timerDuration: number;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // Navigation
  activeView: "notes",
  setActiveView: (view) => set({ activeView: view }),

  // Selection
  activeSubjectId: null,
  activeNoteId: null,
  setActiveSubject: (id) => set({ activeSubjectId: id, activeNoteId: null }),
  setActiveNote: (id) => set({ activeNoteId: id }),

  // Command Palette
  commandPaletteOpen: false,
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Timer (Phase 2)
  timerRunning: false,
  timerSeconds: 0,
  timerDuration: 25 * 60,
}));
