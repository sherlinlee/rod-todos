import { getCategoryMeta } from "@/lib/categories";
import { formatDueDate } from "@/lib/dates";
import type { Todo } from "@/lib/types";

export default function TodoDragPreview({ todo }: { todo: Todo }) {
  const category = getCategoryMeta(todo.category);
  const due = todo.dueDate ? formatDueDate(todo.dueDate) : null;

  return (
    <div className="sortable-drag-preview paper-slip flex items-start gap-1.5 rounded-xl border-2 border-accent/25 px-2 py-2.5 shadow-[0_12px_32px_var(--shadow)] ring-2 ring-accent/15">
      <span className="flex h-10 w-8 shrink-0 items-center justify-center text-foreground/25 sm:h-7 sm:w-5">
        <svg width="8" height="12" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
          <circle cx="2" cy="2" r="1.2" />
          <circle cx="8" cy="2" r="1.2" />
          <circle cx="2" cy="7" r="1.2" />
          <circle cx="8" cy="7" r="1.2" />
          <circle cx="2" cy="12" r="1.2" />
          <circle cx="8" cy="12" r="1.2" />
        </svg>
      </span>
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 rounded-full border border-accent-soft bg-input"
        aria-hidden
      />
      <div className="min-w-0 flex-1 py-0.5">
        <p className="break-words text-sm leading-snug text-foreground">{todo.text}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${category.pill}`}
          >
            {category.emoji} {category.boxLabel}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              due
                ? due.tone === "overdue"
                  ? "bg-red-100 text-red-600"
                  : due.tone === "today"
                    ? "bg-amber-100 text-amber-700"
                    : due.tone === "soon"
                      ? "bg-lavender text-foreground/70"
                      : "bg-white/70 text-foreground/55"
                : "bg-lavender/40 text-foreground/50"
            }`}
          >
            📅 {due ? due.label : "No date"}
          </span>
        </div>
      </div>
    </div>
  );
}
