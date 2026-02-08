import {
  PanelLeftClose,
  PanelLeft,
  Timer,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useSubjectStore } from "@/stores/subjectStore";
import { useNoteStore } from "@/stores/noteStore";

export function TopBar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const activeSubjectId = useAppStore((s) => s.activeSubjectId);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const timerRunning = useAppStore((s) => s.timerRunning);

  const subjects = useSubjectStore((s) => s.subjects);
  const activeNote = useNoteStore((s) => s.activeNote);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  return (
    <header className="flex items-center h-11 px-3 border-b border-notion-border bg-white flex-shrink-0 select-none">
      {/* Timer progress bar (Phase 2 — shown when running) */}
      {timerRunning && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-notion-accent to-blue-400 animate-pulse" />
      )}

      {/* Toggle sidebar */}
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-gray-100 text-notion-text-secondary transition-colors"
        title={sidebarOpen ? "Close sidebar (⌘\\)" : "Open sidebar (⌘\\)"}
      >
        {sidebarOpen ? (
          <PanelLeftClose size={16} strokeWidth={1.8} />
        ) : (
          <PanelLeft size={16} strokeWidth={1.8} />
        )}
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 ml-2 text-sm text-notion-text-secondary">
        {activeSubject && (
          <>
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeSubject.color_hex }}
            />
            <span className="hover:text-notion-text transition-colors">
              {activeSubject.name}
            </span>
          </>
        )}
        {activeSubject && activeNote && (
          <span className="text-notion-text-tertiary">/</span>
        )}
        {activeNote && (
          <span className="text-notion-text font-medium truncate max-w-xs">
            {activeNote.title || "Untitled"}
          </span>
        )}
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Focus Timer trigger (Phase 2) */}
        <button
          disabled
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm text-notion-text-tertiary cursor-not-allowed"
          title="Focus Timer (Coming Soon)"
        >
          <Timer size={15} strokeWidth={1.8} />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* Settings (Phase 2) */}
        <button
          disabled
          className="p-1.5 rounded-md text-notion-text-tertiary cursor-not-allowed"
          title="Settings (Coming Soon)"
        >
          <Settings size={15} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
