// ─── Domain Models ──────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  name: string;
  color_hex: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  subject_id: string;
  title: string;
  content_json: string;
  plain_text: string;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  note_id: string;
  front: string;
  back: string;
  next_review: string;
  interval: number;
  ease_factor: number;
  created_at: string;
}

export interface Task {
  id: string;
  subject_id: string;
  note_id: string | null;
  title: string;
  status: "todo" | "doing" | "done";
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  task_id: string;
  start_time: string;
  duration_seconds: number;
  created_at: string;
}

// ─── App State Types ────────────────────────────────────────────────────────

export type AppView = "notes" | "study" | "planner";

export interface SubjectColor {
  name: string;
  hex: string;
}

export const SUBJECT_COLORS: SubjectColor[] = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Orange", hex: "#f97316" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Slate", hex: "#64748b" },
];
