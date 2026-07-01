import type { SiteOwner } from "@/lib/site";

export type ThemeMode = "light" | "dark";

export function themeStorageKey(siteOwner: SiteOwner = "rod") {
  return `${siteOwner}-theme-mode`;
}

/** @deprecated use themeStorageKey(siteOwner) */
export const THEME_STORAGE_KEY = "belle-theme-mode";

export function getStoredTheme(siteOwner: SiteOwner = "rod"): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(themeStorageKey(siteOwner));
    if (stored === "dark" || stored === "light") return stored;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    /* ignore */
  }
  return "light";
}

export function themeColorFor(mode: ThemeMode, siteOwner: SiteOwner = "rod") {
  if (mode === "dark") {
    return "#14181c";
  }
  return "#eef3f5";
}

export function applyTheme(
  mode: ThemeMode,
  siteOwner: SiteOwner = "rod",
) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem(themeStorageKey(siteOwner), mode);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", themeColorFor(mode, siteOwner));
  }
}
