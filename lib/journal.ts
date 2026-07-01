export type JournalEntry = {
  id: string;
  date: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "rod-journal";

function createNoteId(): string {
  return crypto.randomUUID();
}

function normalizeJournalEntry(
  raw: Partial<JournalEntry>,
  legacyIndex = 0,
): JournalEntry | null {
  if (typeof raw.date !== "string" || typeof raw.text !== "string") {
    return null;
  }

  const updatedAt =
    typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now();
  const createdAt =
    typeof raw.createdAt === "number" ? raw.createdAt : updatedAt;
  const id =
    typeof raw.id === "string" && raw.id
      ? raw.id
      : legacyIndex > 0
        ? `legacy-${raw.date}-${legacyIndex}`
        : `legacy-${raw.date}`;

  return {
    id,
    date: raw.date,
    text: raw.text,
    createdAt,
    updatedAt,
  };
}

export function normalizeJournalEntries(raw: unknown[]): JournalEntry[] {
  const legacyCountByDate = new Map<string, number>();

  return raw
    .map((item) => {
      const partial = item as Partial<JournalEntry>;
      let legacyIndex = 0;
      if (!partial.id) {
        legacyIndex = legacyCountByDate.get(partial.date ?? "") ?? 0;
        legacyCountByDate.set(partial.date ?? "", legacyIndex + 1);
      }
      return normalizeJournalEntry(partial, legacyIndex);
    })
    .filter((entry): entry is JournalEntry => entry !== null);
}

export function loadJournal(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return normalizeJournalEntries(parsed);
  } catch {
    return [];
  }
}

export function saveJournal(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function entryById(
  entries: JournalEntry[],
  id: string,
): JournalEntry | undefined {
  return entries.find((entry) => entry.id === id);
}

export function entriesForDate(
  entries: JournalEntry[],
  date: string,
): JournalEntry[] {
  return entries
    .filter((entry) => entry.date === date && entry.text.trim().length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function appendJournalEntry(
  entries: JournalEntry[],
  date: string,
  text: string,
): { entries: JournalEntry[]; entry: JournalEntry } {
  const now = Date.now();
  const entry: JournalEntry = {
    id: createNoteId(),
    date,
    text,
    createdAt: now,
    updatedAt: now,
  };
  return { entries: [...entries, entry], entry };
}

export function updateJournalEntry(
  entries: JournalEntry[],
  id: string,
  date: string,
  text: string,
): JournalEntry[] {
  const existing = entryById(entries, id);
  if (!existing) return entries;

  if (!text.trim()) {
    return entries.filter((entry) => entry.id !== id);
  }

  const next: JournalEntry = {
    ...existing,
    date,
    text,
    updatedAt: Date.now(),
  };

  return entries.map((entry) => (entry.id === id ? next : entry));
}

export function deleteJournalEntry(
  entries: JournalEntry[],
  id: string,
): JournalEntry[] {
  return entries.filter((entry) => entry.id !== id);
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
    .sort((a, b) => b.updatedAt - a.updatedAt);
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
    list.sort((a, b) => b.updatedAt - a.updatedAt);
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
