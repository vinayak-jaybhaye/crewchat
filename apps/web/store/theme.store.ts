import { create } from "zustand";

type Theme = "light" | "dark";
type ThemeMode = Theme | "system";

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  setTheme: (mode: ThemeMode) => void;
  initTheme: () => void;
}

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",
  theme: "light",

  setTheme: (mode) => {
    const resolved =
      mode === "system" ? getSystemTheme() : mode;

    document.documentElement.dataset.theme = resolved;
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", mode);

    set({ mode, theme: resolved });
  },

  initTheme: () => {
    const stored =
      (localStorage.getItem("theme") as ThemeMode) ?? "system";

    const resolved =
      stored === "system" ? getSystemTheme() : stored;

    document.documentElement.dataset.theme = resolved;
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    set({
      mode: stored,
      theme: resolved,
    });
  },
}));
