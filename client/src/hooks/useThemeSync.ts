// src/hooks/useThemeSync.ts
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export function useThemeSync() {
  const { theme } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";

    // Apply theme class
    root.classList.toggle("dark", isDark);

    // Update theme-color meta tag for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#0f172a" : "#ffffff");
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }, [theme]);
}
