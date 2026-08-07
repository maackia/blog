export const themeStorageKey = "maackia-theme";

export type Theme = "light" | "dark";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(storedTheme: string | null, prefersDark: boolean): Theme {
  if (isTheme(storedTheme)) {
    return storedTheme;
  }

  return prefersDark ? "dark" : "light";
}

export const themeInitScript = `
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("${themeStorageKey}");
  } catch (_) {}
  const theme = storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
`;
