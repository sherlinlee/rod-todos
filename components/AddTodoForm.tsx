"use client";

import { CATEGORIES } from "@/lib/categories";
import { todayString } from "@/lib/dates";
import type { Category } from "@/lib/types";

type AddTodoFormProps = {
  input: string;
  category: Category;
  dueDate: string;
  onInputChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  onDueDateChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function AddTodoForm({
  input,
  category,
  dueDate,
  onInputChange,
  onCategoryChange,
  onDueDateChange,
  onSubmit,
}: AddTodoFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-paper to-card p-3 shadow-[0_4px_18px_var(--shadow)]">
        <div className="mb-2.5 flex items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-[family-name:var(--font-bangers)] text-base leading-none tracking-wide text-foreground shadow-sm"
            aria-hidden
          >
            +
          </span>
          <div>
            <p className="font-[family-name:var(--font-bangers)] text-lg leading-none tracking-wide text-foreground">
              Add a to-do
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-foreground/45">
              What needs doing?
            </p>
          </div>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type your task here…"
          enterKeyHint="done"
          autoComplete="off"
          className="mb-2 w-full rounded-xl border border-accent-soft/40 bg-input px-3.5 py-3 text-[15px] font-semibold text-foreground shadow-sm outline-none transition placeholder:font-normal placeholder:text-foreground/30 focus:border-accent focus:ring-2 focus:ring-accent/20"
          aria-label="New to-do"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-accent py-2.5 font-extrabold tracking-wide text-foreground shadow-[0_3px_12px_var(--shadow)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
          disabled={!input.trim()}
        >
          Add to list
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 px-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-foreground/35">
            Box
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              aria-pressed={category === cat.id}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition active:scale-95 ${
                category === cat.id
                  ? cat.chipActive
                  : "border border-accent-soft/30 bg-input/80 text-foreground/50"
              }`}
            >
              <span className="text-sm leading-none" aria-hidden>
                {cat.emoji}
              </span>
              {cat.boxLabel}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/45">
          <span aria-hidden>📅</span>
          <span className="sr-only">Due date</span>
          <input
            type="date"
            value={dueDate}
            min={todayString()}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="rounded-lg border border-accent-soft/40 bg-input/80 px-2 py-1 text-xs text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>
    </form>
  );
}
