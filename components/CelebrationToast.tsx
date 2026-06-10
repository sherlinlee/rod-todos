"use client";

import { useEffect, useRef } from "react";
import RodCelebrationAvatar from "@/components/RodCelebrationAvatar";
import { debugLog } from "@/lib/debug-log";

type CelebrationToastProps = {
  message: string;
  emoji?: string;
  onDone: () => void;
};

export default function CelebrationToast({
  message,
  onDone,
}: CelebrationToastProps) {
  const shownAt = useRef(Date.now());

  useEffect(() => {
    // #region agent log
    debugLog("H4", "CelebrationToast.tsx:mount", "celebration toast shown", {
      durationMs: 1600,
    }, "post-fix");
    // #endregion
    const timer = window.setTimeout(() => {
      // #region agent log
      debugLog("H4", "CelebrationToast.tsx:onDone", "celebration toast dismissed", {
        visibleMs: Date.now() - shownAt.current,
      }, "post-fix");
      // #endregion
      onDone();
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-6"
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
