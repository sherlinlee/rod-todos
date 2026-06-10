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
      <div className="rounded-2xl border-2 border-accent/35 bg-gradient-to-br from-accent-soft/30 via-paper to-white p-3.5 shadow-[0_6px_24px_rgb(255_122_26_/_0.14)] sm:p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold leading-none text-white shadow-sm"
            aria-hidden
          >
            +
          </span>
          <div>
            <p className="text-base font-bold leading-tight text-foreground">
              Add a to-do
            </p>
            <p className="text-xs text-foreground/50">
              Type it below, then hit Add
            </p>
          </div>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="What needs doing?"
          className="mb-2.5 w-full rounded-xl border-2 border-white/90 bg-white px-4 py-4 text-base text-foreground shadow-sm outline-none transition placeholder:text-base placeholder:font-normal placeholder:text-foreground/30 focus:border-accent focus:ring-4 focus:ring-accent/15"
          aria-label="New to-do"
        />

        <button
          type="submit"
          className="animate-wiggle w-full rounded-xl bg-accent py-3.5 text-base font-bold text-white shadow-[0_4px_14px_rgb(255_122_26_/_0.35)] transition hover:bg-[#e86a10] active:scale-[0.98]"
        >
          Add to list
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 px-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/35">
            Box
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              aria-pressed={category === cat.id}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition active:scale-95 ${
                category === cat.id
                  ? cat.chipActive
                  : "bg-background/80 text-foreground/45 hover:text-foreground/65"
              }`}
            >
              <span className="text-xs leading-none" aria-hidden>
                {cat.emoji}
              </span>
              {cat.boxLabel}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground/40">
          <span aria-hidden>📅</span>
          <span className="sr-only">Due date</span>
          <input
            type="date"
            value={dueDate}
            min={todayString()}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="rounded-md border border-accent-soft/40 bg-white/70 px-1.5 py-0.5 text-[11px] text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>
    </form>
  );
}
