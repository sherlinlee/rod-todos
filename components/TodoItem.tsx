"use client";

import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ReminderTimePicker from "@/components/ReminderTimePicker";
import { getCategories, getCategoryMeta } from "@/lib/categories";
import { formatDueDate } from "@/lib/dates";
import { formatTaskReminderTimeLabel } from "@/lib/reminder-prefs";
import type { Category, Todo } from "@/lib/types";

export type TodoUpdates = {
  text: string;
  dueDate: string | null;
  category: Category;
  reminderTime: string | null;
};

type TodoItemProps = {
  todo: Todo;
  isCompleting: boolean;
  isChecking: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: TodoUpdates) => void;
};

const actionBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-lg text-sm text-foreground/40 active:bg-accent-soft/25 active:text-accent sm:h-7 sm:w-7 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100";

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
  const [draftReminderTime, setDraftReminderTime] = useState(
    todo.reminderTime ?? null,
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    disabled: editing,
  });

  useEffect(() => {
    if (!editing) {
      setDraftText(todo.text);
      setDraftDueDate(todo.dueDate ?? "");
      setDraftCategory(todo.category);
      setDraftReminderTime(todo.reminderTime ?? null);
    }
  }, [todo, editing]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.22 : 1,
  };

  const category = getCategoryMeta(todo.category);
  const due = todo.dueDate ? formatDueDate(todo.dueDate) : null;
  const reminderLabel = formatTaskReminderTimeLabel(todo.reminderTime);
  const showChecked = todo.completed || isChecking;
  const showFly = isCompleting && todo.completed;

  function startEdit() {
    setDraftText(todo.text);
    setDraftDueDate(todo.dueDate ?? "");
    setDraftCategory(todo.category);
    setDraftReminderTime(todo.reminderTime ?? null);
    setEditing(true);
  }

  function saveEdit() {
    const text = draftText.trim();
    if (!text) return;

    onUpdate(todo.id, {
      text,
      dueDate: draftDueDate || null,
      category: draftCategory,
      reminderTime: draftDueDate ? draftReminderTime : null,
    });
    setEditing(false);
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      onContextMenu={editing ? undefined : (e) => e.preventDefault()}
      className={`paper-slip group relative flex flex-col gap-1.5 rounded-xl border border-accent-soft/45 px-2 py-2.5 sm:py-2 ${
        editing ? "" : "select-none"
      } ${
        isDragging
          ? "pointer-events-none border-dashed border-accent-soft/60"
          : editing
            ? "border-accent/50 ring-1 ring-accent/15"
            : "hover:border-accent/40"
      } ${showFly ? "animate-complete-fly" : isDragging ? "" : "animate-pop-in"} ${
        isChecking ? "bg-accent/[0.06]" : ""
      }`}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          disabled={editing}
          className="sortable-handle tap-pad flex h-10 w-8 shrink-0 cursor-grab touch-none select-none items-center justify-center text-foreground/20 transition hover:text-accent active:cursor-grabbing disabled:opacity-30 sm:h-7 sm:w-5"
          aria-label={`Drag to reorder ${todo.text}`}
          onContextMenu={(e) => e.preventDefault()}
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
                ? "border-accent bg-accent text-on-accent"
                : "border-accent-soft bg-surface"
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
              className="w-full rounded-lg border border-accent-soft/60 bg-surface px-2.5 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              aria-label="Edit task"
            />

            <label className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-foreground/60">
              <span>📅 Due</span>
              <input
                type="date"
                value={draftDueDate}
                onChange={(e) => {
                  const next = e.target.value;
                  setDraftDueDate(next);
                  if (!next) setDraftReminderTime(null);
                }}
                className="min-w-0 flex-1 rounded-lg border border-accent-soft/50 bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
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
              {getCategories().map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setDraftCategory(cat.id)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    draftCategory === cat.id
                      ? cat.pill
                      : "bg-surface/80 text-foreground/45"
                  }`}
                >
                  {cat.emoji} {cat.boxLabel}
                </button>
              ))}
            </div>

            {draftDueDate && (
              <ReminderTimePicker
                value={draftReminderTime}
                onChange={setDraftReminderTime}
                idPrefix={`edit-todo-${todo.id}`}
                compact
              />
            )}

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-on-accent"
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
                          : "bg-surface/70 text-foreground/55"
                    : "bg-lavender/40 text-foreground/50"
                }`}
              >
                📅 {due ? due.label : "No date"}
              </span>

              {reminderLabel && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-soft/35 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                  🔔 {reminderLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {!editing && (
          <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
            <button
              type="button"
              onClick={startEdit}
              aria-label={`Edit "${todo.text}"`}
              className={actionBtnClass}
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              aria-label={`Delete "${todo.text}"`}
              className={actionBtnClass}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
