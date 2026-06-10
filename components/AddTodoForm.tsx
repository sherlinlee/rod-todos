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
    <form onSubmit={onSubmit} className="space-y-2.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Add a task…"
          className="paper-slip min-w-0 flex-1 rounded-xl border border-accent-soft/60 px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-xs placeholder:text-foreground/35 focus:border-accent focus:ring-2 focus:ring-accent/15"
          aria-label="New to-do"
        />
        <button
          type="submit"
          className="animate-wiggle shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#ff7a9d] active:scale-95"
        >
          Add
        </button>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-foreground/50">
          Sort into a box
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`paper-box flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition active:scale-[0.98] ${
                category === cat.id ? cat.boxActive : cat.boxIdle
              }`}
            >
              <span className="text-base leading-none">{cat.emoji}</span>
              <div className="min-w-0">
                <span className="block truncate text-xs font-bold text-foreground">
                  {cat.boxLabel}
                </span>
                <span className="text-[10px] text-foreground/45">{cat.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-xl bg-lavender/25 px-2.5 py-2 text-xs font-semibold text-foreground/65">
        <span className="shrink-0">📅 Due</span>
        <input
          type="date"
          value={dueDate}
          min={todayString()}
          onChange={(e) => onDueDateChange(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-accent-soft/50 bg-white/80 px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>
    </form>
  );
}
