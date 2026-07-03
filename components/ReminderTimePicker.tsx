"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import TimeWheelPicker, {
  type TimeWheelPickerHandle,
} from "@/components/TimeWheelPicker";
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

export type ReminderTimePickerHandle = {
  /** Read the wheel's current position and sync parent state. */
  flush: () => string | null;
};

const ReminderTimePicker = forwardRef<
  ReminderTimePickerHandle,
  ReminderTimePickerProps
>(function ReminderTimePicker(
  {
    value,
    onChange,
    disabled = false,
    idPrefix = "reminder",
    compact = false,
  },
  ref,
) {
  const wheelRef = useRef<TimeWheelPickerHandle>(null);
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

  useImperativeHandle(
    ref,
    () => ({
      flush() {
        if (!enabled) return null;
        const next = wheelRef.current?.flush();
        if (!next) return value;
        const time24 = formatTaskReminderTime(next.hour24, next.minute);
        onChange(time24);
        return time24;
      },
    }),
    [enabled, onChange, value],
  );

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
          ref={wheelRef}
          value={value}
          disabled={disabled}
          aria-label="Reminder time"
          onChange={(next) =>
            onChange(formatTaskReminderTime(next.hour24, next.minute))
          }
        />
      )}
    </div>
  );
});

export default ReminderTimePicker;
