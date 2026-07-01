export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

/** Calendar date (YYYY-MM-DD) in a given IANA timezone, e.g. America/New_York */
export function todayStringInTimezone(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function dayBefore(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day - 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDueDate(iso: string): {
  label: string;
  tone: "default" | "today" | "soon" | "overdue";
} {
  const due = new Date(`${iso}T12:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diff = Math.round(
    (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) {
    const days = Math.abs(diff);
    return {
      label: days === 1 ? "Yesterday" : `${days}d overdue`,
      tone: "overdue",
    };
  }
  if (diff === 0) return { label: "Today", tone: "today" };
  if (diff === 1) return { label: "Tomorrow", tone: "soon" };
  if (diff <= 7) {
    return {
      label: due.toLocaleDateString(undefined, { weekday: "short" }),
      tone: "soon",
    };
  }

  return {
    label: due.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    tone: "default",
  };
}
