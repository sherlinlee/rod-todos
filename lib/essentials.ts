import { todayString } from "@/lib/dates";
import type { Todo } from "@/lib/types";

/** Legacy Belle ritual — stripped from Rod's app */
export const PILLS_ID = "essential-birth-control";
export const DEVOTION_ID = "essential-devotion";

/** @deprecated use PILLS_ID */
export const BIRTH_CONTROL_ID = PILLS_ID;

const ESSENTIAL_TEMPLATES: Todo[] = [
  {
    id: DEVOTION_ID,
    text: "devotion + pray",
    completed: false,
    createdAt: 0,
    dueDate: null,
    category: "personal",
    order: -999,
    permanent: true,
    lastCompletedDate: null,
  },
];

const templateById = new Map(
  ESSENTIAL_TEMPLATES.map((template) => [template.id, template]),
);

export function isPermanentTodo(todo: Todo) {
  return todo.permanent === true && todo.id !== PILLS_ID;
}

export function ensureEssentials(todos: Todo[]): Todo[] {
  const today = todayString();
  const withoutPills = todos.filter((todo) => todo.id !== PILLS_ID);

  const synced = withoutPills.map((todo) => {
    if (!todo.permanent) return todo;

    const template = templateById.get(todo.id);
    const doneToday = todo.lastCompletedDate === today;

    return {
      ...todo,
      text: template?.text ?? todo.text,
      order: template?.order ?? todo.order,
      completed: doneToday,
    };
  });

  const existingIds = new Set(synced.map((todo) => todo.id));
  const missing = ESSENTIAL_TEMPLATES.filter(
    (template) => !existingIds.has(template.id),
  );

  return [...missing, ...synced].sort((a, b) => a.order - b.order);
}

export function completePermanentTodo(todo: Todo): Todo {
  return {
    ...todo,
    completed: true,
    lastCompletedDate: todayString(),
  };
}

export function uncompletePermanentTodo(todo: Todo): Todo {
  return {
    ...todo,
    completed: false,
    lastCompletedDate: null,
  };
}

export function pendingEssentials(todos: Todo[]): Todo[] {
  return todos
    .filter(isPermanentTodo)
    .filter((todo) => !todo.completed)
    .sort((a, b) => a.order - b.order);
}

export function allEssentialsDoneToday(todos: Todo[]): boolean {
  const essentials = todos.filter(isPermanentTodo);
  return essentials.length > 0 && essentials.every((todo) => todo.completed);
}

export function isRegularTodo(todo: Todo) {
  return !isPermanentTodo(todo);
}

export function visibleEssentials(
  todos: Todo[],
  statusFilter: "all" | "active" | "completed",
): Todo[] {
  const essentials = todos
    .filter(isPermanentTodo)
    .sort((a, b) => a.order - b.order);

  if (statusFilter === "active") {
    return essentials.filter((t) => !t.completed);
  }
  if (statusFilter === "completed") {
    return essentials.filter((t) => t.completed);
  }
  return essentials;
}
