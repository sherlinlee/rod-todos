import { getSiteConfig } from "@/lib/site";
import { loadSyncData, saveSyncData } from "@/lib/server/store";
import type { PushMessage } from "@/lib/push-types";
import type { Todo } from "@/lib/types";
import {
  getDefaultReminderPreferences,
  matchesTaskReminderTime,
  normalizeReminderPreferences,
  parseTaskReminderTime,
  type ReminderPreferences,
} from "@/lib/reminder-prefs";
import type { StoredPushSubscription } from "@/lib/push-types";
import type { RodSyncData } from "@/lib/sync-types";

function todayInTimezone(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function isDueToday(todo: Todo, today: string) {
  return !todo.completed && todo.dueDate === today && !todo.permanent;
}

function isOverdue(todo: Todo, today: string) {
  return (
    !todo.completed &&
    !todo.permanent &&
    todo.dueDate !== null &&
    todo.dueDate < today
  );
}

function summarizeTodos(todos: Todo[], limit = 3) {
  const preview = todos
    .slice(0, limit)
    .map((todo) => todo.text.trim())
    .filter(Boolean)
    .join(" · ");

  const extra = todos.length - limit;
  if (extra > 0) {
    return `${preview} (+${extra} more)`;
  }
  return preview;
}

/** @deprecated Use per-subscription reminder prefs instead. */
export function getReminderTimezone() {
  return getDefaultReminderPreferences().timezone;
}

/** @deprecated Use per-subscription reminder prefs instead. */
export function getReminderHour() {
  return getDefaultReminderPreferences().hour;
}

export function getSubscriptionReminderPreferences(
  subscription: StoredPushSubscription,
): ReminderPreferences {
  return normalizeReminderPreferences(subscription.reminder);
}

export async function buildDailyReminderMessage(
  timeZone: string,
): Promise<PushMessage | null> {
  const site = getSiteConfig();
  const sync = await loadSyncData();
  if (!sync) return null;

  const today = todayInTimezone(timeZone);
  const dueToday = sync.todos.filter((todo) => isDueToday(todo, today));
  const overdue = sync.todos.filter((todo) => isOverdue(todo, today));

  if (dueToday.length === 0 && overdue.length === 0) return null;

  if (overdue.length > 0 && dueToday.length === 0) {
    return {
      title: `${site.appName} — overdue`,
      body: summarizeTodos(overdue),
      url: "/",
      tag: "todo-reminder-overdue",
    };
  }

  if (dueToday.length > 0 && overdue.length === 0) {
    return {
      title: `${site.appName} — due today`,
      body: summarizeTodos(dueToday),
      url: "/",
      tag: "todo-reminder-today",
    };
  }

  return {
    title: `${site.appName} — your list`,
    body: `${dueToday.length} due today · ${overdue.length} overdue · ${summarizeTodos([...dueToday, ...overdue])}`,
    url: "/",
    tag: "todo-reminder-mixed",
  };
}

export function findTaskRemindersDueNow(
  sync: RodSyncData,
  timeZone: string,
  now = new Date(),
  force = false,
) {
  const today = todayInTimezone(timeZone);

  return sync.todos.filter((todo) => {
    if (todo.completed || todo.permanent || !todo.dueDate || !todo.reminderTime) {
      return false;
    }
    if (!parseTaskReminderTime(todo.reminderTime)) return false;
    if (todo.dueDate !== today) return false;
    if (!force && todo.lastRemindedDate === today) return false;
    if (!force && !matchesTaskReminderTime(todo.reminderTime, timeZone, now)) {
      return false;
    }
    return true;
  });
}

export function buildTaskReminderMessage(todo: Todo): PushMessage {
  const site = getSiteConfig();
  return {
    title: `${site.appName} — time to go`,
    body: todo.text.trim() || "Task reminder",
    url: "/",
    tag: `todo-reminder-${todo.id}`,
  };
}

export async function markTodosReminded(
  todoIds: string[],
  date: string,
): Promise<boolean> {
  if (todoIds.length === 0) return true;

  const sync = await loadSyncData();
  if (!sync) return false;

  const idSet = new Set(todoIds);
  const now = Date.now();
  const next: RodSyncData = {
    ...sync,
    updatedAt: now,
    todos: sync.todos.map((todo) =>
      idSet.has(todo.id)
        ? { ...todo, lastRemindedDate: date, updatedAt: now }
        : todo,
    ),
  };

  return saveSyncData(next);
}
