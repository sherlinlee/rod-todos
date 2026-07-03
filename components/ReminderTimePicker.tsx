"use client";

import TimeWheelPicker from "@/components/TimeWheelPicker";
import {
  defaultTimeWheelValue,
  parseTime24,
} from "@/lib/time-wheel";
import { formatTaskReminderTime } from "@/lib/reminder-prefs";

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
  const parsed = parseTime24(value);
  const enabled = parsed !== null;

  function setEnabled(next: boolean) {
    if (!next) {
      onChange(null);
      return;
    }
    const defaults = defaultTimeWheelValue();
    onChange(defaults.time24);
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <label
        htmlFor={`${idPrefix}-toggle`}
        className="flex items-center gap-2 text-[11px] font-semibold text-foreground/60"
      >
        <input
          id={`${idPrefix}-toggle`}
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded border-accent-soft text-accent focus:ring-accent/20"
        />
        <span>🔔 Remind at a specific time</span>
      </label>

      {enabled && (
        <TimeWheelPicker
          value={value}
          disabled={disabled}
          aria-label="Reminder time"
          onChange={(next) => onChange(formatTaskReminderTime(next.hour24, next.minute))}
        />
      )}
    </div>
  );
}
