"use client";

import { useRef } from "react";
import { getCategories } from "@/lib/categories";
import ReminderTimePicker, {
  type ReminderTimePickerHandle,
} from "@/components/ReminderTimePicker";
import AddedPrompt from "@/components/AddedPrompt";
import { todayString } from "@/lib/dates";
import type { Category } from "@/lib/types";

type AddTodoFormProps = {
  input: string;
  category: Category;
  dueDate: string;
  reminderTime: string | null;
  showAddedPrompt?: boolean;
  addedPromptKey?: number;
  onAddedPromptDone?: () => void;
  onInputChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  onDueDateChange: (value: string) => void;
  onReminderTimeChange: (value: string | null) => void;
  onSubmit: (
    e: React.FormEvent,
    extras?: { reminderTime: string | null },
  ) => void;
};

export default function AddTodoForm({
  input,
  category,
  dueDate,
  reminderTime,
  showAddedPrompt = false,
  addedPromptKey = 0,
  onAddedPromptDone,
  onInputChange,
  onCategoryChange,
  onDueDateChange,
  onReminderTimeChange,
  onSubmit,
}: AddTodoFormProps) {
  const reminderPickerRef = useRef<ReminderTimePickerHandle>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const flushedReminder = dueDate
      ? reminderPickerRef.current?.flush() ?? reminderTime
      : null;
    onSubmit(e, { reminderTime: flushedReminder });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Add a task…"
          className="paper-slip min-h-14 min-w-0 flex-1 rounded-xl border border-accent-soft/60 px-4 py-3.5 text-base text-foreground outline-none transition placeholder:text-sm placeholder:text-foreground/35 focus:border-accent focus:ring-2 focus:ring-accent/15 sm:min-h-[3.25rem] sm:py-3"
          aria-label="New to-do"
        />
        <button
          type="submit"
          className="animate-wiggle min-h-14 shrink-0 rounded-xl bg-accent px-5 py-3.5 text-base font-bold text-on-accent shadow-sm transition hover:bg-accent-deep active:scale-95 sm:min-h-[3.25rem] sm:py-3"
        >
          Add
        </button>
      </div>

      {showAddedPrompt && onAddedPromptDone && (
        <div className="pointer-events-none flex justify-center">
          <AddedPrompt key={addedPromptKey} onDone={onAddedPromptDone} />
        </div>
      )}

      <label className="flex items-center gap-2 rounded-xl bg-lavender/25 px-3 py-2 text-xs font-semibold text-foreground/65 dark:bg-accent-soft/25 dark:text-foreground/75">
        <span className="shrink-0">📅 Due</span>
        <input
          type="date"
          value={dueDate}
          min={todayString()}
          onChange={(e) => {
            const next = e.target.value;
            onDueDateChange(next);
            if (!next) onReminderTimeChange(null);
          }}
          className="min-w-0 flex-1 rounded-lg border border-accent-soft/50 bg-surface/80 px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      {dueDate && (
        <div className="rounded-xl bg-background/60 px-3 py-2">
          <ReminderTimePicker
            ref={reminderPickerRef}
            value={reminderTime}
            onChange={onReminderTimeChange}
            idPrefix="add-todo-reminder"
            compact
          />
        </div>
      )}

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-foreground/45">
          Sort into a box
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {getCategories().map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`paper-box flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-center transition active:scale-[0.98] ${
                category === cat.id ? cat.boxActive : cat.boxIdle
              }`}
            >
              <span className="shrink-0 text-sm leading-none">{cat.emoji}</span>
              <span className="text-[11px] font-bold leading-tight text-foreground">
                {cat.boxLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
