"use client";

import BookAvatar from "@/components/BookAvatar";
import { DEVOTION_ID } from "@/lib/essentials";
import type { Todo } from "@/lib/types";

type EssentialsStripProps = {
  todos: Todo[];
  completingId: string | null;
  onToggle: (id: string) => void;
};

export default function EssentialsStrip({
  todos,
  completingId,
  onToggle,
}: EssentialsStripProps) {
  if (todos.length === 0) return null;

  return (
    <div className="mb-3 rounded-xl border border-accent-soft/35 bg-background/60 px-2.5 py-2">
      <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-foreground/40">
        rituals
      </p>
      <div className="flex flex-wrap gap-2">
        {todos.map((todo) => (
          <button
            key={todo.id}
            type="button"
            onClick={() => onToggle(todo.id)}
            aria-label={
              todo.completed
                ? `Mark "${todo.text}" as not done today`
                : `Mark "${todo.text}" as done today`
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
              completingId === todo.id ? "animate-complete-fly" : ""
            } ${
              todo.completed
                ? "border-accent-soft/50 bg-white/70 text-foreground/40 line-through"
                : "border-accent-soft/70 bg-white text-foreground"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                todo.completed
                  ? "border-accent bg-accent text-white"
                  : "border-accent-soft/80 bg-white"
              }`}
            >
              {todo.completed ? "✓" : ""}
            </span>
            {todo.id === DEVOTION_ID && <BookAvatar size={16} />}
            <span>{todo.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
