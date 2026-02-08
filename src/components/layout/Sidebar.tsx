import { useState } from "react";
import {
  Search,
  FileText,
  BookOpen,
  LayoutDashboard,
  Plus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Circle,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useSubjectStore } from "@/stores/subjectStore";
import { useNoteStore } from "@/stores/noteStore";
import { SUBJECT_COLORS } from "@/lib/types";
import type { AppView } from "@/lib/types";

// ─── Navigation Items ───────────────────────────────────────────────────────

const NAV_ITEMS: { id: AppView; label: string; icon: typeof FileText }[] = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "study", label: "Study", icon: BookOpen },
  { id: "planner", label: "Planner", icon: LayoutDashboard },
];

// ─── Sidebar Component ──────────────────────────────────────────────────────

export function Sidebar() {
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);

  return (
    <aside className="flex h-full w-60 flex-col bg-notion-sidebar border-r border-notion-border">
      {/* Search Bar */}
      <button
        onClick={toggleCommandPalette}
        className="mx-2 mt-3 mb-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-sidebar-hover transition-colors"
      >
        <Search size={15} strokeWidth={2} />
        <span>Search</span>
        <kbd className="ml-auto text-[10px] text-notion-text-tertiary bg-white/60 px-1.5 py-0.5 rounded border border-notion-border">
          {"\u2318"}K
        </kbd>
      </button>

      {/* Navigation */}
      <nav className="px-2 mt-3">
        <p className="px-2.5 mb-1 text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
          Workspace
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isDisabled = item.id !== "notes"; // Phase 2+
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setActiveView(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-notion-sidebar-active text-notion-text font-medium"
                  : isDisabled
                    ? "text-notion-text-tertiary cursor-not-allowed"
                    : "text-notion-text-secondary hover:bg-notion-sidebar-hover"
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{item.label}</span>
              {isDisabled && (
                <span className="ml-auto text-[10px] bg-notion-sidebar-active text-notion-text-tertiary px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-notion-border" />

      {/* Subjects */}
      <div className="flex-1 overflow-y-auto px-2">
        <SubjectList />
      </div>
    </aside>
  );
}

// ─── Subject List ───────────────────────────────────────────────────────────

function SubjectList() {
  const subjects = useSubjectStore((s) => s.subjects);
  const createSubject = useSubjectStore((s) => s.createSubject);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setIsCreating(false);
      return;
    }
    const colorIdx = subjects.length % SUBJECT_COLORS.length;
    const color = SUBJECT_COLORS[colorIdx].hex;
    await createSubject(name, color);
    setNewName("");
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-2.5 mb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
          Subjects
        </p>
        <button
          onClick={() => setIsCreating(true)}
          className="p-0.5 rounded hover:bg-notion-sidebar-hover text-notion-text-tertiary hover:text-notion-text-secondary transition-colors"
          title="Add subject"
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Subject items */}
      {subjects.map((subject) => (
        <SubjectItem key={subject.id} subject={subject} />
      ))}

      {/* Inline create form */}
      {isCreating && (
        <div className="px-2.5 py-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setIsCreating(false);
                setNewName("");
              }
            }}
            onBlur={handleCreate}
            placeholder="Subject name..."
            className="w-full bg-white border border-notion-border rounded px-2 py-1 text-sm outline-none focus:border-notion-accent focus:ring-1 focus:ring-notion-accent/30"
          />
        </div>
      )}

      {/* Empty state */}
      {subjects.length === 0 && !isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full px-2.5 py-4 text-center text-sm text-notion-text-tertiary hover:text-notion-text-secondary transition-colors"
        >
          <Plus size={16} className="mx-auto mb-1" />
          Add your first subject
        </button>
      )}
    </div>
  );
}

// ─── Subject Item (expandable with notes) ───────────────────────────────────

function SubjectItem({
  subject,
}: {
  subject: { id: string; name: string; color_hex: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hovered, setHovered] = useState(false);

  const activeSubjectId = useAppStore((s) => s.activeSubjectId);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const setActiveSubject = useAppStore((s) => s.setActiveSubject);
  const setActiveNote = useAppStore((s) => s.setActiveNote);

  const notes = useNoteStore((s) => s.notes);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const createNote = useNoteStore((s) => s.createNote);
  const deleteSubject = useSubjectStore((s) => s.deleteSubject);

  const isActive = activeSubjectId === subject.id;
  const subjectNotes = notes.filter((n) => n.subject_id === subject.id);

  const handleToggle = async () => {
    if (!expanded) {
      setActiveSubject(subject.id);
      await fetchNotes(subject.id);
    }
    setExpanded(!expanded);
  };

  const handleAddNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSubject(subject.id);
    if (!expanded) {
      await fetchNotes(subject.id);
      setExpanded(true);
    }
    const note = await createNote(subject.id);
    setActiveNote(note.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (isActive) {
      setActiveSubject(null);
      setActiveNote(null);
    }
    await deleteSubject(subject.id);
  };

  return (
    <div>
      {/* Subject row */}
      <button
        className={`w-full group flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer transition-colors text-left ${
          isActive
            ? "bg-notion-sidebar-active"
            : "hover:bg-notion-sidebar-hover"
        }`}
        onClick={handleToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setShowMenu(false);
        }}
        aria-label={subject.name}
      >
        {expanded ? (
          <ChevronDown size={14} className="text-notion-text-tertiary flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-notion-text-tertiary flex-shrink-0" />
        )}
        <Circle
          size={8}
          fill={subject.color_hex}
          stroke="none"
          className="flex-shrink-0"
        />
        <span className="flex-1 text-sm text-notion-text truncate">
          {subject.name}
        </span>

        {/* Hover actions */}
        {hovered && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleAddNote}
              className="p-0.5 rounded hover:bg-notion-sidebar-active text-notion-text-tertiary hover:text-notion-text-secondary"
              title="Add note"
            >
              <Plus size={13} />
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-0.5 rounded hover:bg-notion-sidebar-active text-notion-text-tertiary hover:text-notion-text-secondary"
              >
                <MoreHorizontal size={13} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 z-50 w-36 bg-white border border-notion-border rounded-lg shadow-lg py-1">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </button>

      {/* Notes under subject */}
      {expanded && (
        <div className="ml-3 pl-3 border-l border-notion-border/50">
          {subjectNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => {
                setActiveSubject(subject.id);
                setActiveNote(note.id);
              }}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors ${
                activeNoteId === note.id
                  ? "bg-notion-sidebar-active text-notion-text font-medium"
                  : "text-notion-text-secondary hover:bg-notion-sidebar-hover"
              }`}
            >
              <FileText size={13} strokeWidth={1.8} className="flex-shrink-0" />
              <span className="truncate">{note.title || "Untitled"}</span>
            </button>
          ))}

          {/* New note button (always visible when expanded) */}
          <button
            onClick={handleAddNote}
            className="w-full flex items-center gap-2 rounded-md px-2 py-1 text-xs text-notion-text-tertiary hover:text-notion-text-secondary hover:bg-notion-sidebar-hover transition-colors"
          >
            <Plus size={12} strokeWidth={2} className="flex-shrink-0" />
            <span>New note</span>
          </button>
        </div>
      )}
    </div>
  );
}
