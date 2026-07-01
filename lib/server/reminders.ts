import { getSiteConfig } from "@/lib/site";
import { loadSyncData } from "@/lib/server/store";
import type { PushMessage } from "@/lib/push-types";
import type { Todo } from "@/lib/types";

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

function hourInTimezone(timeZone: string): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  return Number(hour);
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

export function getReminderTimezone() {
  return (
    process.env.PUSH_REMINDER_TIMEZONE?.trim() ||
    process.env.APP_TIMEZONE?.trim() ||
    "Asia/Singapore"
  );
}

export function getReminderHour() {
  const parsed = Number(process.env.PUSH_REMINDER_HOUR ?? "8");
  if (!Number.isFinite(parsed)) return 8;
  return Math.min(23, Math.max(0, Math.floor(parsed)));
}

export function shouldSendScheduledReminders(now = new Date()) {
  const timeZone = getReminderTimezone();
  const targetHour = getReminderHour();
  const currentHour = hourInTimezone(timeZone);
  if (currentHour !== targetHour) return false;

  const minute = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      minute: "numeric",
    }).format(now),
  );
  return minute < 15;
}

export async function buildDailyReminderMessage(): Promise<PushMessage | null> {
  const site = getSiteConfig();
  const sync = await loadSyncData();
  if (!sync) return null;

  const today = todayInTimezone(getReminderTimezone());
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
