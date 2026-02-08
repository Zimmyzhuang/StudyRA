import { useState, useEffect, useCallback, useRef } from "react";
import {
  GripVertical,
  Plus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code2,
  Quote,
  Minus,
  Trash2,
  Copy,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface BlockHandleProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Block type options for the "+" dropdown
const BLOCK_TYPES = [
  { label: "Text", icon: Type, command: "paragraph" },
  { label: "Heading 1", icon: Heading1, command: "h1" },
  { label: "Heading 2", icon: Heading2, command: "h2" },
  { label: "Heading 3", icon: Heading3, command: "h3" },
  { label: "Bullet List", icon: List, command: "bulletList" },
  { label: "Numbered List", icon: ListOrdered, command: "orderedList" },
  { label: "To-do List", icon: CheckSquare, command: "taskList" },
  { label: "Code Block", icon: Code2, command: "codeBlock" },
  { label: "Quote", icon: Quote, command: "blockquote" },
  { label: "Divider", icon: Minus, command: "horizontalRule" },
];

export function BlockHandle({ editor, containerRef }: BlockHandleProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0 });
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [hoveredBlockPos, setHoveredBlockPos] = useState<number | null>(null);

  const handleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Track which block the mouse is hovering over ────────────────────

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Find the ProseMirror editor element
      const proseMirror = container.querySelector(".ProseMirror");
      if (!proseMirror) return;

      // Get all top-level block nodes
      const blocks = proseMirror.querySelectorAll(":scope > *");
      const containerRect = container.getBoundingClientRect();

      let found = false;
      for (const block of blocks) {
        const rect = block.getBoundingClientRect();

        // Check if mouse Y is within this block
        if (e.clientY >= rect.top - 2 && e.clientY <= rect.bottom + 2) {
          const top = rect.top - containerRect.top;
          setPosition({ top });
          setVisible(true);
          found = true;

          // Find the ProseMirror position for this block
          const pos = editor.view.posAtDOM(block, 0);
          setHoveredBlockPos(pos > 0 ? pos - 1 : pos);
          break;
        }
      }

      if (!found) {
        setVisible(false);
        setShowBlockMenu(false);
        setShowContextMenu(false);
      }
    },
    [containerRef, editor]
  );

  const handleMouseLeave = useCallback(() => {
    // Small delay to allow clicking the handle
    setTimeout(() => {
      if (
        !handleRef.current?.matches(":hover") &&
        !menuRef.current?.matches(":hover")
      ) {
        setVisible(false);
        setShowBlockMenu(false);
        setShowContextMenu(false);
      }
    }, 150);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef, handleMouseMove, handleMouseLeave]);

  // ── Close menus on outside click ────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        handleRef.current &&
        !handleRef.current.contains(e.target as Node)
      ) {
        setShowBlockMenu(false);
        setShowContextMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Block type conversion ───────────────────────────────────────────

  const handleBlockTypeSelect = (command: string) => {
    if (hoveredBlockPos === null) return;

    // Focus editor at the hovered block
    editor.chain().focus().setTextSelection(hoveredBlockPos).run();

    switch (command) {
      case "paragraph":
        editor.chain().focus().setParagraph().run();
        break;
      case "h1":
        editor.chain().focus().setHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().setHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().setHeading({ level: 3 }).run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "taskList":
        editor.chain().focus().toggleTaskList().run();
        break;
      case "codeBlock":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "horizontalRule":
        editor.chain().focus().setHorizontalRule().run();
        break;
    }

    setShowBlockMenu(false);
  };

  // ── Context menu actions ────────────────────────────────────────────

  const handleDeleteBlock = () => {
    if (hoveredBlockPos === null) return;
    editor
      .chain()
      .focus()
      .setTextSelection(hoveredBlockPos)
      .selectParentNode()
      .deleteSelection()
      .run();
    setShowContextMenu(false);
  };

  const handleDuplicateBlock = () => {
    if (hoveredBlockPos === null) return;
    // Select the block, copy its content, insert after
    editor.chain().focus().setTextSelection(hoveredBlockPos).run();
    const { from } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);
    if (node) {
      const endPos = from + node.nodeSize;
      editor
        .chain()
        .focus()
        .insertContentAt(endPos, node.toJSON())
        .run();
    }
    setShowContextMenu(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Handle (positioned to the left of the editor) */}
      <div
        ref={handleRef}
        className="absolute -left-12 flex items-center gap-0.5 opacity-0 hover:opacity-100 transition-opacity duration-100"
        style={{
          top: position.top,
          opacity: visible ? undefined : 0,
        }}
        onMouseEnter={() => setVisible(true)}
      >
        {/* Plus button → Block type picker */}
        <button
          onClick={() => {
            setShowBlockMenu(!showBlockMenu);
            setShowContextMenu(false);
          }}
          className="p-0.5 rounded hover:bg-gray-100 text-notion-text-tertiary hover:text-notion-text-secondary transition-colors"
          title="Add block"
        >
          <Plus size={15} strokeWidth={2} />
        </button>

        {/* Grip handle → Context menu (delete, duplicate) */}
        <button
          onClick={() => {
            setShowContextMenu(!showContextMenu);
            setShowBlockMenu(false);
          }}
          className="p-0.5 rounded hover:bg-gray-100 text-notion-text-tertiary hover:text-notion-text-secondary transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to move / Click for options"
        >
          <GripVertical size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Block Type Dropdown */}
      {showBlockMenu && (
        <div
          ref={menuRef}
          className="absolute -left-12 z-50 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-1 max-h-72 overflow-y-auto"
          style={{ top: position.top + 28 }}
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-notion-text-tertiary">
            Turn into
          </p>
          {BLOCK_TYPES.map((block) => {
            const Icon = block.icon;
            return (
              <button
                key={block.command}
                onClick={() => handleBlockTypeSelect(block.command)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-notion-text hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center bg-white">
                  <Icon size={15} strokeWidth={1.6} />
                </div>
                <span>{block.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Context Menu (Grip) */}
      {showContextMenu && (
        <div
          ref={menuRef}
          className="absolute -left-12 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1"
          style={{ top: position.top + 28 }}
        >
          <button
            onClick={handleDuplicateBlock}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-notion-text hover:bg-gray-50 transition-colors"
          >
            <Copy size={14} strokeWidth={1.6} />
            Duplicate
          </button>
          <div className="mx-2 my-1 border-t border-gray-100" />
          <button
            onClick={handleDeleteBlock}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} strokeWidth={1.6} />
            Delete
          </button>
        </div>
      )}
    </>
  );
}
