"use client";

import { useEffect } from "react";

type CelebrationToastProps = {
  message: string;
  emoji: string;
  onDone: () => void;
};

export default function CelebrationToast({
  message,
  emoji,
  onDone,
}: CelebrationToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-6"
      role="status"
      aria-live="polite"
    >
      <div className="animate-celebration-pop flex max-w-md flex-col items-center gap-3 rounded-[2rem] border-2 border-accent-soft/60 bg-card/95 px-8 py-6 text-center shadow-[0_24px_60px_var(--shadow)] backdrop-blur-md sm:px-10 sm:py-7">
        <span className="animate-celebration-bounce text-4xl sm:text-5xl">
          {emoji}
        </span>
        <p className="text-base font-bold leading-snug text-foreground sm:text-lg">
          {message}
        </p>
      </div>
    </div>
  );
}
