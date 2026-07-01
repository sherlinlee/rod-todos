"use client";

import { useEffect } from "react";
import BottomNav from "@/components/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    document.documentElement.classList.add("viewport-locked");
    document.body.classList.add("viewport-locked");

    return () => {
      document.documentElement.classList.remove("viewport-locked");
      document.body.classList.remove("viewport-locked");
    };
  }, []);

  return (
    <div className="app-shell">
      <div className="app-scroll">{children}</div>
      <BottomNav />
    </div>
  );
}
