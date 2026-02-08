import { FileText, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useSubjectStore } from "@/stores/subjectStore";

export function EmptyState() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const subjects = useSubjectStore((s) => s.subjects);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
        <FileText size={28} strokeWidth={1.2} className="text-notion-text-tertiary" />
      </div>

      <h2 className="text-lg font-semibold text-notion-text mb-1.5">
        {subjects.length === 0 ? "Welcome to Recallify" : "Select a note"}
      </h2>

      <p className="text-sm text-notion-text-secondary max-w-sm leading-relaxed">
        {subjects.length === 0
          ? "Create your first subject in the sidebar to start taking notes. Your knowledge journey begins here."
          : "Choose a note from the sidebar to start editing, or create a new one."}
      </p>

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="mt-5 flex items-center gap-2 text-sm text-notion-accent hover:underline"
        >
          <ArrowLeft size={14} />
          Open sidebar
        </button>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="mt-8 flex items-center gap-4 text-xs text-notion-text-tertiary">
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px]">
            {"\u2318"}K
          </kbd>{" "}
          Search
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px]">
            {"\u2318"}\
          </kbd>{" "}
          Sidebar
        </span>
      </div>
    </div>
  );
}
