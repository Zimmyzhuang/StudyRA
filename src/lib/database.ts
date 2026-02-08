/**
 * Database abstraction layer.
 *
 * When running inside Tauri, uses `invoke` to call Rust commands.
 * When running in the browser (dev mode without Tauri), falls back
 * to an in-memory store backed by localStorage for rapid UI iteration.
 */

import type { Note, Subject } from "./types";

// ─── Tauri Detection ────────────────────────────────────────────────────────

const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function invoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (isTauri()) {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(command, args);
  }
  return mockInvoke<T>(command, args);
}

// ─── Mock Database (Browser Fallback) ───────────────────────────────────────

const STORAGE_KEY = "recallify_mock_db";

interface MockDB {
  subjects: Subject[];
  notes: Note[];
}

function loadMockDb(): MockDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { subjects: [], notes: [] };
}

function saveMockDb(db: MockDB): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

async function mockInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  const db = loadMockDb();

  switch (command) {
    // ── Subjects ──
    case "get_subjects":
      return db.subjects.sort((a, b) => a.name.localeCompare(b.name)) as T;

    case "create_subject": {
      const subject: Subject = {
        id: uuid(),
        name: args?.name as string,
        color_hex: args?.color_hex as string,
        created_at: now(),
        updated_at: now(),
      };
      db.subjects.push(subject);
      saveMockDb(db);
      return subject as T;
    }

    case "update_subject": {
      const idx = db.subjects.findIndex((s) => s.id === args?.id);
      if (idx !== -1) {
        db.subjects[idx] = {
          ...db.subjects[idx],
          name: args?.name as string,
          color_hex: args?.color_hex as string,
          updated_at: now(),
        };
        saveMockDb(db);
        return db.subjects[idx] as T;
      }
      throw new Error("Subject not found");
    }

    case "delete_subject": {
      db.subjects = db.subjects.filter((s) => s.id !== args?.id);
      db.notes = db.notes.filter((n) => n.subject_id !== args?.id);
      saveMockDb(db);
      return undefined as T;
    }

    // ── Notes ──
    case "get_notes":
      return db.notes
        .filter((n) => n.subject_id === args?.subject_id)
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime()
        ) as T;

    case "get_all_notes":
      return db.notes.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ) as T;

    case "get_note": {
      const note = db.notes.find((n) => n.id === args?.id);
      if (note) return note as T;
      throw new Error("Note not found");
    }

    case "create_note": {
      const note: Note = {
        id: uuid(),
        subject_id: args?.subject_id as string,
        title: args?.title as string,
        content_json: "{}",
        plain_text: "",
        created_at: now(),
        updated_at: now(),
      };
      db.notes.push(note);
      saveMockDb(db);
      return note as T;
    }

    case "update_note": {
      const idx = db.notes.findIndex((n) => n.id === args?.id);
      if (idx !== -1) {
        db.notes[idx] = {
          ...db.notes[idx],
          title: args?.title as string,
          content_json: args?.content_json as string,
          plain_text: args?.plain_text as string,
          updated_at: now(),
        };
        saveMockDb(db);
        return db.notes[idx] as T;
      }
      throw new Error("Note not found");
    }

    case "delete_note": {
      db.notes = db.notes.filter((n) => n.id !== args?.id);
      saveMockDb(db);
      return undefined as T;
    }

    case "search_notes": {
      const q = ((args?.query as string) || "").toLowerCase();
      return db.notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.plain_text.toLowerCase().includes(q)
      ) as T;
    }

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const db = {
  subjects: {
    getAll: () => invoke<Subject[]>("get_subjects"),
    create: (name: string, colorHex: string) =>
      invoke<Subject>("create_subject", { name, color_hex: colorHex }),
    update: (id: string, name: string, colorHex: string) =>
      invoke<Subject>("update_subject", { id, name, color_hex: colorHex }),
    delete: (id: string) => invoke<void>("delete_subject", { id }),
  },
  notes: {
    getBySubject: (subjectId: string) =>
      invoke<Note[]>("get_notes", { subject_id: subjectId }),
    getAll: () => invoke<Note[]>("get_all_notes"),
    get: (id: string) => invoke<Note>("get_note", { id }),
    create: (subjectId: string, title: string) =>
      invoke<Note>("create_note", { subject_id: subjectId, title }),
    update: (
      id: string,
      title: string,
      contentJson: string,
      plainText: string
    ) =>
      invoke<Note>("update_note", {
        id,
        title,
        content_json: contentJson,
        plain_text: plainText,
      }),
    delete: (id: string) => invoke<void>("delete_note", { id }),
    search: (query: string) => invoke<Note[]>("search_notes", { query }),
  },
};
