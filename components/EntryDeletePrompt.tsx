"use client";

import type { MouseEvent } from "react";

type EntryDeletePromptProps = {
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
};

function guardFocus(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

const pillClass =
  "rounded-full px-2 py-0.5 text-[10px] font-bold transition active:scale-95";

export default function EntryDeletePrompt({
  onConfirm,
  onCancel,
  className = "",
}: EntryDeletePromptProps) {
  return (
    <span
      role="group"
      aria-label="Confirm delete entry"
      className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}
    >
      <span className="text-[10px] font-semibold text-foreground/55">
        delete entry?
      </span>
      <button
        type="button"
        onMouseDown={guardFocus}
        onClick={(event) => {
          event.stopPropagation();
          onConfirm();
        }}
        className={`${pillClass} bg-accent text-white`}
      >
        yes
      </button>
      <button
        type="button"
        onMouseDown={guardFocus}
        onClick={(event) => {
          event.stopPropagation();
          onCancel();
        }}
        className={`${pillClass} bg-accent-soft/40 text-foreground/70`}
      >
        no
      </button>
    </span>
  );
}
