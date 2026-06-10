"use client";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

type MicButtonProps = {
  onTranscript: (text: string) => void;
  onInterim?: (text: string) => void;
  className?: string;
  size?: "sm" | "md";
};

export default function MicButton({
  onTranscript,
  onInterim,
  className = "",
  size = "md",
}: MicButtonProps) {
  const { supported, listening, error, toggle } = useSpeechRecognition();

  const dim = size === "sm" ? "h-9 w-9 text-base" : "h-11 w-11 text-lg";

  if (!supported) return null;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={() => void toggle(onTranscript, onInterim)}
        aria-label={listening ? "Stop recording" : "Record with mic"}
        aria-pressed={listening}
        className={`${dim} flex shrink-0 items-center justify-center rounded-full border-2 transition active:scale-95 ${
          listening
            ? "animate-pulse border-accent bg-accent text-foreground shadow-md"
            : "border-accent-soft/70 bg-input text-foreground/70 hover:border-accent hover:text-accent"
        }`}
      >
        {listening ? "◼" : "🎙️"}
      </button>
      {listening && (
        <span className="mt-1 text-[10px] font-semibold text-accent">
          listening…
        </span>
      )}
      {error && (
        <span className="mt-1 max-w-[9rem] text-center text-[10px] font-semibold leading-snug text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
