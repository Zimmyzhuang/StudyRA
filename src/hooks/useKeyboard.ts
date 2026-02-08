import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

/**
 * Global keyboard shortcuts (Cmd+K, Cmd+\, etc.)
 */
export function useKeyboardShortcuts() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;

      // Cmd+K → Command Palette (Spotlight search)
      if (meta && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }

      // Cmd+\ → Toggle Sidebar
      if (meta && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, toggleCommandPalette]);
}
