import { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Code,
  Sparkles,
} from "lucide-react";
import { useNoteStore } from "@/stores/noteStore";
import { BlockHandle } from "./BlockHandle";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const activeNote = useNoteStore((s) => s.activeNote);
  const fetchNote = useNoteStore((s) => s.fetchNote);
  const updateNote = useNoteStore((s) => s.updateNote);

  const [title, setTitle] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // ── TipTap Editor Setup ─────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: "#2383e2", width: 2 },
      }),
      Highlight.configure({
        HTMLAttributes: { class: "highlight" },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading";
          return "Type '/' for commands, or just start writing...";
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      debouncedSave(ed.getJSON(), ed.getText());
    },
  });

  // ── Load note data ────────────────────────────────────────────────────

  useEffect(() => {
    fetchNote(noteId);
  }, [noteId, fetchNote]);

  useEffect(() => {
    if (activeNote && activeNote.id === noteId) {
      setTitle(activeNote.title || "");

      // Only set editor content if it differs (avoid cursor jump)
      if (editor && activeNote.content_json !== "{}") {
        try {
          const content = JSON.parse(activeNote.content_json);
          const currentContent = editor.getJSON();
          if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
            editor.commands.setContent(content);
          }
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, [activeNote, noteId, editor]);

  // ── Auto-save (debounced) ─────────────────────────────────────────────

  const debouncedSave = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (contentJson: any, plainText: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        updateNote(noteId, title, JSON.stringify(contentJson), plainText);
      }, 500);
    },
    [noteId, title, updateNote]
  );

  // Save title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (editor) {
        updateNote(
          noteId,
          newTitle,
          JSON.stringify(editor.getJSON()),
          editor.getText()
        );
      }
    }, 500);
  };

  // ── Title → Editor focus transition (Enter key) ──────────────────────

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editor?.commands.focus("start");
    }
  };

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  // ── Cleanup ───────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 sm:px-12 lg:px-16">
      {/* Title */}
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder="Untitled"
        rows={1}
        className="w-full text-[2.25rem] font-bold text-notion-text placeholder:text-notion-text-tertiary leading-tight resize-none outline-none bg-transparent mb-4"
      />

      {/* Editor with Block Handle */}
      <div ref={editorContainerRef} className="relative">
        {/* Floating Bubble Menu (on text selection) */}
        <BubbleMenu
          editor={editor}
          tippyOptions={{
            duration: 150,
            placement: "top",
          }}
        >
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 shadow-lg rounded-lg px-1 py-0.5">
            <BubbleButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold size={15} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic size={15} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough size={15} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              title="Code"
            >
              <Code size={15} />
            </BubbleButton>
            <BubbleButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive("highlight")}
              title="Highlight"
            >
              <Highlighter size={15} />
            </BubbleButton>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Phase 2+ actions */}
            <button
              disabled
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-notion-text-tertiary cursor-not-allowed"
              title="Make Recall Card (Coming Soon)"
            >
              <Sparkles size={13} />
              <span>Card</span>
            </button>
          </div>
        </BubbleMenu>

        {/* Block Handle (Hover & Handle) */}
        <BlockHandle
          editor={editor}
          containerRef={editorContainerRef}
        />

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ─── BubbleMenu Button ──────────────────────────────────────────────────────

function BubbleButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-gray-100 text-notion-text"
          : "text-notion-text-secondary hover:bg-gray-50 hover:text-notion-text"
      }`}
    >
      {children}
    </button>
  );
}
