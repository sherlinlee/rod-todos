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
              ? `${totalSaved} ${totalSaved === 1 ? "day" : "days"} · tap a day to edit`
              : "past days show up here as you write"}
          </span>
        </div>
        <span className="text-sm text-foreground/45">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="mt-3 border-t border-accent-soft/35 pt-3">
          {archive.length === 0 ? (
            <div className="rounded-xl bg-background/70 px-3 py-6 text-center">
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
                    className="rounded-xl border border-accent-soft/35 bg-background/50"
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
                                  {group.entries.map((entry) => (
                                    <li key={entry.date}>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onSelectDate?.(entry.date)
                                        }
                                        className={`paper-slip w-full rounded-xl border px-2.5 py-2 text-left transition active:scale-[0.99] ${
                                          entry.date === today
                                            ? "border-accent-soft/70 bg-white/80"
                                            : "border-accent-soft/40 hover:border-accent-soft/65"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <p className="text-[10px] font-bold text-foreground/50">
                                            {formatJournalDate(entry.date)}
                                          </p>
                                          {entry.date === today && (
                                            <span className="rounded-full bg-accent-soft/50 px-1.5 py-0.5 text-[9px] font-bold text-foreground/55">
                                              today
                                            </span>
                                          )}
                                        </div>
                                        <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-snug text-foreground/80">
                                          {entry.text}
                                        </p>
                                      </button>
                                    </li>
                                  ))}
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
