export type JournalEntry = {
  date: string;
  text: string;
  updatedAt: number;
};

const STORAGE_KEY = "rod-journal";

export function loadJournal(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry) =>
        typeof entry.date === "string" &&
        typeof entry.text === "string" &&
        typeof entry.updatedAt === "number",
    );
  } catch {
    return [];
  }
}

export function saveJournal(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function upsertJournalEntry(
  entries: JournalEntry[],
  date: string,
  text: string,
): JournalEntry[] {
  const existing = entries.find((entry) => entry.date === date);

  if (!text.trim()) {
    if (!existing) return entries;
    return entries.filter((entry) => entry.date !== date);
  }

  const next: JournalEntry = {
    date,
    text,
    updatedAt: Date.now(),
  };

  if (!existing) return [...entries, next];

  return entries.map((entry) => (entry.date === date ? next : entry));
}

export function entryForDate(
  entries: JournalEntry[],
  date: string,
): JournalEntry | undefined {
  return entries.find((entry) => entry.date === date);
}

export function pastEntries(entries: JournalEntry[], today: string): JournalEntry[] {
  return entries
    .filter((entry) => entry.date !== today && entry.text.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function savedJournalCount(entries: JournalEntry[]): number {
  return entries.filter((entry) => entry.text.trim().length > 0).length;
}

export function formatMonthYearLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export type JournalMonthGroup = {
  month: number;
  label: string;
  entries: JournalEntry[];
};

export type JournalYearGroup = {
  year: number;
  months: JournalMonthGroup[];
};

export function savedJournalEntries(entries: JournalEntry[]): JournalEntry[] {
  return entries
    .filter((entry) => entry.text.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function groupJournalArchive(entries: JournalEntry[]): JournalYearGroup[] {
  const saved = savedJournalEntries(entries);
  const byMonth = new Map<string, JournalEntry[]>();

  for (const entry of saved) {
    const [year, month] = entry.date.split("-");
    const key = `${year}-${month}`;
    const list = byMonth.get(key) ?? [];
    list.push(entry);
    byMonth.set(key, list);
  }

  for (const list of byMonth.values()) {
    list.sort((a, b) => b.date.localeCompare(a.date));
  }

  const years = new Map<number, JournalMonthGroup[]>();

  for (const key of [...byMonth.keys()].sort((a, b) => b.localeCompare(a))) {
    const [yearStr, monthStr] = key.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const group: JournalMonthGroup = {
      month,
      label: formatMonthYearLabel(year, month),
      entries: byMonth.get(key)!,
    };
    if (!years.has(year)) years.set(year, []);
    years.get(year)!.push(group);
  }

  return [...years.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({ year, months }));
}
