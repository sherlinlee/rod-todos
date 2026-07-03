"use client";

import { useEffect } from "react";
import { getSiteConfig } from "@/lib/site";

const PROMPT_MS = 900;

type AddedPromptProps = {
  onDone: () => void;
};

export default function AddedPrompt({ onDone }: AddedPromptProps) {
  const site = getSiteConfig();

  useEffect(() => {
    const timer = window.setTimeout(onDone, PROMPT_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="animate-completion-flash flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-accent-soft/50 bg-card/95 px-4 py-2.5 shadow-[0_8px_28px_var(--shadow)] backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <span className="animate-check-pop text-lg leading-none" aria-hidden>
        {site.navTodoEmoji}
      </span>
      <p className="text-sm font-bold text-foreground">added!</p>
    </div>
  );
}
