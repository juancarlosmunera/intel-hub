import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "intelhub-theme";

// Light is the product default. A saved choice always wins.
export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through
  }
  return "light";
}

// Apply immediately so there is no flash before React mounts.
export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore persistence failure
    }
  }, [theme]);

  const setTheme = useCallback((next) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return { theme, setTheme, toggleTheme };
}
