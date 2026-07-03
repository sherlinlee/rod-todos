export const WHEEL_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const WHEEL_MINUTES = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
] as const;
export const WHEEL_PERIODS = ["AM", "PM"] as const;

export type WheelPeriod = (typeof WHEEL_PERIODS)[number];
export type WheelHour = (typeof WHEEL_HOURS)[number];
export type WheelMinute = (typeof WHEEL_MINUTES)[number];

export type TimeWheelValue = {
  hour12: WheelHour;
  minute: WheelMinute;
  period: WheelPeriod;
  /** e.g. "9:35 AM" */
  label12: string;
  hour24: number;
  /** e.g. "09:35" */
  time24: string;
};

export function hour12To24(hour12: number, period: WheelPeriod): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function hour24To12(hour24: number): { hour12: WheelHour; period: WheelPeriod } {
  const period: WheelPeriod = hour24 >= 12 ? "PM" : "AM";
  const raw = hour24 % 12 || 12;
  const hour12 = WHEEL_HOURS.includes(raw as WheelHour)
    ? (raw as WheelHour)
    : 12;
  return { hour12, period };
}

export function snapToWheelMinute(minute: number): WheelMinute {
  const snapped = Math.round(minute / 5) * 5;
  const clamped = Math.min(55, Math.max(0, snapped));
  return clamped as WheelMinute;
}

export function buildTimeWheelValue(
  hour12: WheelHour,
  minute: WheelMinute,
  period: WheelPeriod,
): TimeWheelValue {
  const hour24 = hour12To24(hour12, period);
  const minutePadded = String(minute).padStart(2, "0");
  const hour24Padded = String(hour24).padStart(2, "0");
  return {
    hour12,
    minute,
    period,
    label12: `${hour12}:${minutePadded} ${period}`,
    hour24,
    time24: `${hour24Padded}:${minutePadded}`,
  };
}

export function parseTime24(value: string | null | undefined): TimeWheelValue | null {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (
    !Number.isInteger(hour24) ||
    hour24 < 0 ||
    hour24 > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const { hour12, period } = hour24To12(hour24);
  return buildTimeWheelValue(hour12, snapToWheelMinute(minute), period);
}

export function defaultTimeWheelValue(): TimeWheelValue {
  return buildTimeWheelValue(9, 0, "AM");
}

export function timeWheelFrom24(value: string | null | undefined): TimeWheelValue {
  return parseTime24(value) ?? defaultTimeWheelValue();
}
