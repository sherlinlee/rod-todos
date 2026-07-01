"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { applyTheme, getStoredTheme, type ThemeMode } from "@/lib/theme";
import { getSiteConfig } from "@/lib/site";

export default function ThemeToggle() {
  const pathname = usePathname();
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") return "light";
    const theme = document.documentElement.dataset.theme;
    return theme === "dark" ? "dark" : "light";
  });

  if (pathname === "/login") return null;

  function toggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next, getSiteConfig().owner);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="safe-pt fixed right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex h-10 w-10 items-center justify-center rounded-full border border-panel bg-card/90 text-lg text-foreground shadow-[0_8px_24px_var(--shadow)] backdrop-blur-md transition active:scale-95 dark:bg-card/95"
    >
      {mode === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
