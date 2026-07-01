import { isTodoDueToday, todayString } from "@/lib/dates";
import { isRegularTodo } from "@/lib/essentials";
import type { Todo } from "@/lib/types";

export function isTodayRegularTodo(todo: Todo, today = todayString()) {
  return isRegularTodo(todo) && isTodoDueToday(todo, today);
}

export function todayRegularTodos(list: Todo[], today = todayString()) {
  return list.filter((todo) => isTodayRegularTodo(todo, today));
}

export function remainingTodayRegularCount(list: Todo[], today = todayString()) {
  return todayRegularTodos(list, today).filter((todo) => !todo.completed).length;
}
