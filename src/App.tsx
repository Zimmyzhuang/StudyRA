import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { EmptyState } from "@/components/layout/EmptyState";
import { CommandPalette } from "@/components/CommandPalette";
import { useAppStore } from "@/stores/appStore";
import { useSubjectStore } from "@/stores/subjectStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboard";

export default function App() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);

  // Load data on mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <div
        className={`sidebar-transition flex-shrink-0 overflow-hidden ${
          sidebarOpen ? "w-60" : "w-0"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {activeNoteId ? <NoteEditor noteId={activeNoteId} /> : <EmptyState />}
        </main>
      </div>

      {/* Command Palette (Spotlight) */}
      <CommandPalette />
    </div>
  );
}
