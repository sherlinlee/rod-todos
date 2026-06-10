"use client";

import { useState } from "react";
import type { JournalYearGroup } from "@/lib/journal";
import { formatJournalDate } from "@/lib/verses";

type JournalArchiveProps = {
  archive: JournalYearGroup[];
  totalSaved: number;
  today: string;
  onSelectDate?: (date: string) => void;
};

export default function JournalArchive({
  archive,
  totalSaved,
  today,
  onSelectDate,
}: JournalArchiveProps) {
  const [open, setOpen] = useState(totalSaved > 0);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => {
    const first = archive[0]?.year;
    return first ? new Set([first]) : new Set();
  });
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
    const firstYear = archive[0];
    const firstMonth = firstYear?.months[0];
    if (!firstYear || !firstMonth) return new Set();
    return new Set([`${firstYear.year}-${firstMonth.month}`]);
  });
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
    new Set(),
  );

  function toggleYear(year: number) {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  function toggleMonth(key: string) {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleEntry(date: string) {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  return (
    <section className="mt-3 rounded-[1.25rem] border border-white/80 bg-card/90 p-3 shadow-[0_12px_32px_var(--shadow)] backdrop-blur-sm sm:p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div>
          <span className="block text-xs font-bold uppercase tracking-wide text-foreground/55">
            your journal
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold text-foreground/40">
            {totalSaved > 0
              ? `${totalSaved} ${totalSaved === 1 ? "day" : "days"} · tap to read or edit`
              : "past days show up here as you write"}
          </span>
        </div>
        <span className="text-sm text-foreground/45">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="mt-3 border-t border-accent-soft/35 pt-3">
          {archive.length === 0 ? (
            <div className="rounded-xl bg-paper px-3 py-6 text-center">
              <p className="text-sm font-semibold text-foreground/55">
                nothing written yet
              </p>
              <p className="mt-1 text-xs text-foreground/40">
                each day you reflect, it&apos;s saved here in the app
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {archive.map(({ year, months }) => {
                const yearOpen = expandedYears.has(year);
                const monthCount = months.reduce(
                  (sum, group) => sum + group.entries.length,
                  0,
                );

                return (
                  <div
                    key={year}
                    className="rounded-xl border border-accent-soft/35 bg-paper/80"
                  >
                    <button
                      type="button"
                      onClick={() => toggleYear(year)}
                      className="flex w-full items-center justify-between px-2.5 py-2 text-left"
                    >
                      <span className="text-sm font-bold text-foreground/75">
                        {year}
                      </span>
                      <span className="text-[10px] font-semibold text-foreground/45">
                        {monthCount} {monthCount === 1 ? "entry" : "entries"}{" "}
                        {yearOpen ? "▾" : "▸"}
                      </span>
                    </button>

                    {yearOpen && (
                      <div className="space-y-1.5 border-t border-accent-soft/25 px-2 pb-2 pt-1.5">
                        {months.map((group) => {
                          const monthKey = `${year}-${group.month}`;
                          const monthOpen = expandedMonths.has(monthKey);

                          return (
                            <div key={monthKey}>
                              <button
                                type="button"
                                onClick={() => toggleMonth(monthKey)}
                                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-white/50"
                              >
                                <span className="text-xs font-bold text-foreground/60">
                                  {group.label}
                                </span>
                                <span className="text-[10px] font-semibold text-foreground/40">
                                  {group.entries.length}{" "}
                                  {group.entries.length === 1 ? "day" : "days"}{" "}
                                  {monthOpen ? "▾" : "▸"}
                                </span>
                              </button>

                              {monthOpen && (
                                <ul className="mt-1 space-y-1.5 pl-1">
                                  {group.entries.map((entry) => {
                                    const entryOpen = expandedEntries.has(
                                      entry.date,
                                    );

                                    return (
                                      <li
                                        key={entry.date}
                                        className={`paper-slip rounded-xl border transition ${
                                          entry.date === today
                                            ? "border-accent-soft/70"
                                            : "border-accent-soft/40"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2 px-2.5 pt-2">
                                          <div className="flex min-w-0 items-center gap-2">
                                            <p className="text-[10px] font-bold text-foreground/50">
                                              {formatJournalDate(entry.date)}
                                            </p>
                                            {entry.date === today && (
                                              <span className="rounded-full bg-accent-soft/40 px-1.5 py-0.5 text-[9px] font-bold text-foreground/55">
                                                today
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {entryOpen ? (
                                          <div className="px-2.5 pb-2.5 pt-1">
                                            <div className="max-h-56 overflow-y-auto rounded-lg border border-accent-soft/20 bg-white/80 px-2.5 py-2">
                                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85">
                                                {entry.text}
                                              </p>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  toggleEntry(entry.date)
                                                }
                                                className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-accent"
                                              >
                                                Show less
                                                <span aria-hidden>▾</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  onSelectDate?.(entry.date)
                                                }
                                                className="text-[11px] font-bold text-accent underline-offset-2 hover:underline"
                                              >
                                                Edit entry
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              toggleEntry(entry.date)
                                            }
                                            className="w-full px-2.5 pb-2.5 pt-1 text-left"
                                            aria-expanded={false}
                                          >
                                            <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-snug text-foreground/70">
                                              {entry.text}
                                            </p>
                                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-accent">
                                              Tap for more
                                              <span aria-hidden>▸</span>
                                            </span>
                                          </button>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
