"use client";

import { useEffect } from "react";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { getSiteConfig } from "@/lib/site";

export default function ThemeInit() {
  useEffect(() => {
    const site = getSiteConfig();
    applyTheme(getStoredTheme(site.owner), site.owner);
  }, []);

  return null;
}
