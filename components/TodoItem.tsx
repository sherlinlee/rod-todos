"use client";

import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CATEGORIES, getCategoryMeta } from "@/lib/categories";
import { formatDueDate } from "@/lib/dates";
import type { Category, Todo } from "@/lib/types";

export type TodoUpdates = {
  text: string;
  dueDate: string | null;
  category: Category;
};

type TodoItemProps = {
  todo: Todo;
  isCompleting: boolean;
  isChecking: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: TodoUpdates) => void;
};

export default function TodoItem({
  todo,
  isCompleting,
  isChecking,
  onToggle,
  onDelete,
  onUpdate,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);
  const [draftDueDate, setDraftDueDate] = useState(todo.dueDate ?? "");
  const [draftCategory, setDraftCategory] = useState(todo.category);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: editing });

  useEffect(() => {
    if (!editing) {
      setDraftText(todo.text);
      setDraftDueDate(todo.dueDate ?? "");
      setDraftCategory(todo.category);
    }
  }, [todo, editing]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const category = getCategoryMeta(todo.category);
  const due = todo.dueDate ? formatDueDate(todo.dueDate) : null;

  function startEdit() {
    setDraftText(todo.text);
    setDraftDueDate(todo.dueDate ?? "");
    setDraftCategory(todo.category);
    setEditing(true);
  }

  function saveEdit() {
    const text = draftText.trim();
    if (!text) return;

    onUpdate(todo.id, {
      text,
      dueDate: draftDueDate || null,
      category: draftCategory,
    });
    setEditing(false);
  }

  const showChecked = todo.completed || isChecking;
  const showFly = isCompleting && todo.completed;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`paper-slip group relative flex flex-col gap-1.5 rounded-xl border border-accent-soft/45 px-2 py-2.5 transition sm:py-2 ${
        isDragging
          ? "z-10 scale-[1.01] shadow-md ring-2 ring-accent/25"
          : editing
            ? "border-accent/50 ring-1 ring-accent/15"
            : "hover:border-accent/40"
      } ${showFly ? "animate-complete-fly" : "animate-pop-in"} ${
        isChecking ? "bg-accent/[0.06]" : ""
      }`}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          disabled={editing}
          className="flex h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-foreground/20 transition hover:text-accent active:cursor-grabbing disabled:opacity-30 sm:h-7"
          aria-label={`Drag to reorder ${todo.text}`}
          {...attributes}
          {...listeners}
        >
          <svg width="8" height="12" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="2" cy="2" r="1.2" />
            <circle cx="8" cy="2" r="1.2" />
            <circle cx="2" cy="7" r="1.2" />
            <circle cx="8" cy="7" r="1.2" />
            <circle cx="2" cy="12" r="1.2" />
            <circle cx="8" cy="12" r="1.2" />
          </svg>
        </button>

        <button
          type="button"
          disabled={editing}
          onClick={() => onToggle(todo.id)}
          aria-label={
            todo.completed
              ? `Mark "${todo.text}" as incomplete`
              : `Mark "${todo.text}" as complete`
          }
          className="tap-pad flex shrink-0 items-center justify-center disabled:opacity-40"
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
              showChecked
                ? "border-accent bg-accent text-white"
                : "border-accent-soft bg-white"
            } ${
              isChecking && !todo.completed
                ? "animate-check-fill"
                : isChecking
                  ? "animate-check-pop"
                  : "transition active:scale-95"
            }`}
          >
            {showChecked && (
              <span
                className={`text-[10px] leading-none ${
                  isChecking ? "animate-check-mark-pop" : ""
                }`}
              >
                ✓
              </span>
            )}
          </span>
        </button>

        {editing ? (
          <div className="min-w-0 flex-1 space-y-2">
            <input
              type="text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full rounded-lg border border-accent-soft/60 bg-white px-2.5 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              aria-label="Edit task"
            />

            <label className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-foreground/60">
              <span>📅 Due</span>
              <input
                type="date"
                value={draftDueDate}
                onChange={(e) => setDraftDueDate(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-accent-soft/50 bg-white px-2 py-1.5 text-sm outline-none focus:border-accent"
              />
              {draftDueDate && (
                <button
                  type="button"
                  onClick={() => setDraftDueDate("")}
                  className="text-accent"
                >
                  Clear
                </button>
              )}
            </label>

            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDraftCategory(cat.id)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    draftCategory === cat.id
                      ? cat.pill
                      : "bg-white/80 text-foreground/45"
                  }`}
                >
                  {cat.emoji} {cat.boxLabel}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg bg-background px-3 py-1.5 text-xs font-semibold text-foreground/50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1 py-0.5">
            <p
              className={`break-words text-sm leading-snug ${
                showChecked
                  ? "text-foreground/40 line-through decoration-accent-soft"
                  : "text-foreground"
              } ${isChecking ? "animate-strike-sweep" : ""}`}
            >
              {todo.text}
            </p>

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
        )}

        {!editing && (
          <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
            <button
              type="button"
              onClick={startEdit}
              aria-label={`Edit "${todo.text}"`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-foreground/40 active:bg-accent-soft/25 active:text-accent sm:h-7 sm:w-7 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              aria-label={`Delete "${todo.text}"`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-foreground/40 active:bg-accent-soft/25 active:text-accent sm:h-7 sm:w-7 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
