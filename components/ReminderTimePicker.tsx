"use client";

import {
  REMINDER_MINUTES,
  formatTaskReminderTime,
  parseTaskReminderTime,
} from "@/lib/reminder-prefs";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);

function formatHourLabel(hour: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12} ${period}`;
}

const selectClassName =
  "rounded-lg border border-accent-soft/50 bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent";

type ReminderTimePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  idPrefix?: string;
  compact?: boolean;
};

export default function ReminderTimePicker({
  value,
  onChange,
  disabled = false,
  idPrefix = "reminder",
  compact = false,
}: ReminderTimePickerProps) {
  const parsed = parseTaskReminderTime(value);
  const enabled = parsed !== null;
  const hour = parsed?.hour ?? 9;
  const minute = parsed?.minute ?? 0;

  function setEnabled(next: boolean) {
    if (!next) {
      onChange(null);
      return;
    }
    onChange(formatTaskReminderTime(hour, minute));
  }

  function setHour(nextHour: number) {
    onChange(formatTaskReminderTime(nextHour, minute));
  }

  function setMinute(nextMinute: number) {
    onChange(formatTaskReminderTime(hour, nextMinute));
  }

  return (
    <div className={compact ? "flex flex-wrap items-center gap-1.5" : "space-y-2"}>
      <label className="flex items-center gap-2 text-[11px] font-semibold text-foreground/60">
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded border-accent-soft text-accent focus:ring-accent/20"
        />
        <span>🔔 Remind at a specific time</span>
      </label>

      {enabled && (
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="sr-only" htmlFor={`${idPrefix}-hour`}>
            Reminder hour
          </label>
          <select
            id={`${idPrefix}-hour`}
            value={hour}
            disabled={disabled}
            onChange={(e) => setHour(Number(e.target.value))}
            className={selectClassName}
          >
            {HOUR_OPTIONS.map((optionHour) => (
              <option key={optionHour} value={optionHour}>
                {formatHourLabel(optionHour)}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor={`${idPrefix}-minute`}>
            Reminder minute
          </label>
          <select
            id={`${idPrefix}-minute`}
            value={minute}
            disabled={disabled}
            onChange={(e) => setMinute(Number(e.target.value))}
            className={selectClassName}
          >
            {REMINDER_MINUTES.map((optionMinute) => (
              <option key={optionMinute} value={optionMinute}>
                :{String(optionMinute).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
