"use client";

import { useEffect } from "react";

const FLASH_MS = 900;

type CompletionFlashProps = {
  message: string;
  emoji: string;
  onDone: () => void;
};

export default function CompletionFlash({
  message,
  emoji,
  onDone,
}: CompletionFlashProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div className="animate-completion-flash flex max-w-xs items-center gap-2 rounded-full border border-accent-soft/50 bg-card/95 px-4 py-2.5 shadow-[0_8px_28px_var(--shadow)] backdrop-blur-sm">
        <span className="animate-check-pop text-lg leading-none" aria-hidden>
          {emoji}
        </span>
        <p className="text-sm font-bold text-foreground">{message}</p>
      </div>
    </div>
  );
}
