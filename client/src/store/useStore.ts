import { create } from "zustand";
import type { SearchHistoryItem, ThreatData } from "@/types/threat";

const HISTORY_KEY = "threat-intel-history";
const THEME_KEY = "threat-intel-theme";
const MAX_HISTORY = 50;

function loadHistory(): SearchHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadTheme(): "dark" | "light" {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

interface AppState {
  theme: "dark" | "light";
  toggleTheme: () => void;
  history: SearchHistoryItem[];
  addToHistory: (data: ThreatData) => void;
  clearHistory: () => void;
  currentResult: ThreatData | null;
  setCurrentResult: (data: ThreatData | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  theme: loadTheme(),
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  },
  history: loadHistory(),

  addToHistory: (data) => {
    // Add defensive check
    if (!data || !data.input) {
      console.error("Cannot add to history: missing input property", data);
      return;
    }

    const item: SearchHistoryItem = {
      input: data.input,
      inputType: data.inputType || "unknown", // Provide fallback
      riskScore: data.riskScore || 0, // Provide fallback
      timestamp: data.timestamp || new Date().toISOString(), // Provide fallback
    };
    const updated = [
      item,
      ...get().history.filter((h) => h.input !== item.input),
    ].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    set({ history: updated });
  },
  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
    set({ history: [] });
  },
  currentResult: null,
  setCurrentResult: (data) => set({ currentResult: data }),
}));
