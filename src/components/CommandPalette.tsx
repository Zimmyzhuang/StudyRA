import { useState, useEffect, useRef, useCallback } from "react";
import { Search, FileText, X } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useNoteStore } from "@/stores/noteStore";
import { useSubjectStore } from "@/stores/subjectStore";
import { db } from "@/lib/database";
import type { Note } from "@/lib/types";

export function CommandPalette() {
  const isOpen = useAppStore((s) => s.commandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const setActiveSubject = useAppStore((s) => s.setActiveSubject);
  const setActiveNote = useAppStore((s) => s.setActiveNote);
  const subjects = useSubjectStore((s) => s.subjects);
  const fetchNote = useNoteStore((s) => s.fetchNote);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Focus input on open ───────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      // Small delay to ensure DOM is ready
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ── Search with debounce ──────────────────────────────────────────────

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const notes = await db.notes.search(q.trim());
      setResults(notes);
      setSelectedIndex(0);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(query), 200);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, performSearch]);

  // ── Keyboard navigation ───────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          selectNote(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  // ── Select a note ─────────────────────────────────────────────────────

  const selectNote = (note: Note) => {
    setActiveSubject(note.subject_id);
    setActiveNote(note.id);
    fetchNote(note.id);
    setOpen(false);
  };

  // ── Get subject name for a note ───────────────────────────────────────

  const getSubjectName = (subjectId: string): string => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.name || "Unknown";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg">
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search
              size={18}
              className="text-notion-text-tertiary flex-shrink-0"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes..."
              className="flex-1 text-sm outline-none bg-transparent text-notion-text placeholder:text-notion-text-tertiary"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-0.5 rounded hover:bg-gray-100 text-notion-text-tertiary"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="text-[10px] text-notion-text-tertiary bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-center text-sm text-notion-text-tertiary">
                Searching...
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-notion-text-tertiary">
                No notes found for "{query}"
              </div>
            )}

            {!loading && !query && (
              <div className="px-4 py-6 text-center text-sm text-notion-text-tertiary">
                Type to search your notes
              </div>
            )}

            {results.map((note, index) => (
              <button
                key={note.id}
                onClick={() => selectNote(note)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-notion-accent/5"
                    : "hover:bg-gray-50"
                }`}
              >
                <FileText
                  size={16}
                  strokeWidth={1.6}
                  className="text-notion-text-tertiary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-notion-text font-medium truncate">
                    {note.title || "Untitled"}
                  </p>
                  <p className="text-xs text-notion-text-tertiary truncate mt-0.5">
                    {getSubjectName(note.subject_id)}
                    {note.plain_text &&
                      ` · ${note.plain_text.substring(0, 60)}...`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
