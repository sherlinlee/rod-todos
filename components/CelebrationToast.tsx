"use client";

import { useEffect } from "react";
import RodCelebrationAvatar from "@/components/RodCelebrationAvatar";

const TOAST_MS = 1800;

type CelebrationToastProps = {
  message: string;
  emoji?: string;
  onDone: () => void;
};

export default function CelebrationToast({
  message,
  onDone,
}: CelebrationToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="flex w-full justify-center px-2 py-4"
      role="status"
      aria-live="polite"
    >
      <div className="animate-celebration-pop flex max-w-md flex-col items-center gap-3 rounded-[2rem] border-2 border-accent-soft/60 bg-card/95 px-8 py-6 text-center shadow-[0_24px_60px_var(--shadow)] backdrop-blur-md sm:px-10 sm:py-7">
        <RodCelebrationAvatar size={104} />
        <p className="text-base font-bold leading-snug text-foreground sm:text-lg">
          {message}
        </p>
      </div>
    </div>
  );
}
