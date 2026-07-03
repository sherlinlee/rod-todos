export type ReminderPreferences = {
  hour: number;
  minute: number;
  timezone: string;
};

export const REMINDER_MINUTES = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
] as const;

export function getDefaultReminderHour() {
  const parsed = Number(process.env.PUSH_REMINDER_HOUR ?? "8");
  if (!Number.isFinite(parsed)) return 8;
  return Math.min(23, Math.max(0, Math.floor(parsed)));
}

export function getDefaultReminderTimezone() {
  return (
    process.env.PUSH_REMINDER_TIMEZONE?.trim() ||
    process.env.APP_TIMEZONE?.trim() ||
    "Asia/Singapore"
  );
}

export function getDefaultReminderPreferences(): ReminderPreferences {
  return {
    hour: getDefaultReminderHour(),
    minute: 0,
    timezone: getDefaultReminderTimezone(),
  };
}

export function getBrowserDefaultReminderPreferences(): ReminderPreferences {
  const timezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : getDefaultReminderTimezone();

  return {
    hour: 8,
    minute: 0,
    timezone,
  };
}

export function isValidReminderMinute(minute: unknown): minute is number {
  return (
    typeof minute === "number" &&
    Number.isInteger(minute) &&
    REMINDER_MINUTES.includes(minute as (typeof REMINDER_MINUTES)[number])
  );
}

export function isValidReminderHour(hour: unknown): hour is number {
  return typeof hour === "number" && Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

export function isValidTimezone(timezone: unknown): timezone is string {
  if (typeof timezone !== "string" || !timezone.trim()) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone.trim() });
    return true;
  } catch {
    return false;
  }
}

export function parseReminderPreferences(
  value: unknown,
): ReminderPreferences | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ReminderPreferences>;
  if (
    !isValidReminderHour(raw.hour) ||
    !isValidReminderMinute(raw.minute) ||
    !isValidTimezone(raw.timezone)
  ) {
    return null;
  }

  return {
    hour: raw.hour,
    minute: raw.minute,
    timezone: raw.timezone.trim(),
  };
}

export function normalizeReminderPreferences(
  prefs: ReminderPreferences | null | undefined,
): ReminderPreferences {
  return parseReminderPreferences(prefs) ?? getDefaultReminderPreferences();
}

export function timePartsInTimezone(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );

  return { hour, minute };
}

export function matchesReminderSchedule(
  prefs: ReminderPreferences,
  now = new Date(),
) {
  const { hour, minute } = timePartsInTimezone(prefs.timezone, now);
  return hour === prefs.hour && minute === prefs.minute;
}

export function formatReminderTime(prefs: ReminderPreferences) {
  const minute = String(prefs.minute).padStart(2, "0");
  const period = prefs.hour >= 12 ? "PM" : "AM";
  const hour12 = prefs.hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

export function formatTaskReminderTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function parseTaskReminderTime(
  value: string | null | undefined,
): { hour: number; minute: number } | null {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!isValidReminderHour(hour) || !isValidReminderMinute(minute)) return null;
  return { hour, minute };
}

export function formatTaskReminderTimeLabel(value: string | null | undefined) {
  const parsed = parseTaskReminderTime(value);
  if (!parsed) return null;
  return formatReminderTime({
    hour: parsed.hour,
    minute: parsed.minute,
    timezone: "UTC",
  });
}

export function matchesTaskReminderTime(
  reminderTime: string,
  timeZone: string,
  now = new Date(),
) {
  const parsed = parseTaskReminderTime(reminderTime);
  if (!parsed) return false;
  const { hour, minute } = timePartsInTimezone(timeZone, now);
  return hour === parsed.hour && minute === parsed.minute;
}
