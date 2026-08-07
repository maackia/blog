"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";
import { isTheme, resolveTheme, themeStorageKey, type Theme } from "@/lib/theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getStoredTheme() {
  try {
    return localStorage.getItem(themeStorageKey);
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const storedTheme = getStoredTheme();
    const initialTheme = resolveTheme(storedTheme, mediaQuery.matches);

    applyTheme(initialTheme);
    const frame = window.requestAnimationFrame(() => setTheme(initialTheme));

    const followSystemTheme = (event: MediaQueryListEvent) => {
      if (!isTheme(getStoredTheme())) {
        const nextTheme = event.matches ? "dark" : "light";
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }
    };

    mediaQuery.addEventListener("change", followSystemTheme);
    return () => {
      window.cancelAnimationFrame(frame);
      mediaQuery.removeEventListener("change", followSystemTheme);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // The theme still applies for this page when storage is unavailable.
    }
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  const label = theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환";

  return (
    <button
      aria-label={label}
      aria-pressed={theme === "dark"}
      className="border-ink/15 hover:bg-ink hover:text-paper grid size-9 place-items-center rounded-full border transition-colors"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      {theme === null ? (
        <SunMoon aria-hidden="true" size={16} />
      ) : theme === "dark" ? (
        <Sun aria-hidden="true" size={16} />
      ) : (
        <Moon aria-hidden="true" size={16} />
      )}
    </button>
  );
}
