"use client";

import { useState } from "react";
import EntryActionButtons from "@/components/EntryActionButtons";
import EntryDeletePrompt from "@/components/EntryDeletePrompt";
import { formatNoteDate, formatNoteTime } from "@/lib/dates";
import type { JournalYearGroup } from "@/lib/journal";

type NotesArchiveProps = {
  archive: JournalYearGroup[];
  totalSaved: number;
  today: string;
  activeNoteId?: string | null;
  editingText?: string;
  pendingDeleteId?: string | null;
  onSelectNote?: (id: string) => void;
  onCopyNote?: (text: string) => void;
  onDeleteNote?: (id: string) => void;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
};

const archivePillClass =
  "inline-flex items-center gap-1 rounded-full bg-accent-soft/45 px-2.5 py-1 text-[10px] font-bold text-accent";

export default function NotesArchive({
  archive,
  totalSaved,
  today,
  activeNoteId,
  editingText,
  pendingDeleteId,
  onSelectNote,
  onCopyNote,
  onDeleteNote,
  onConfirmDelete,
  onCancelDelete,
}: NotesArchiveProps) {
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

  function toggleEntry(id: string) {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="mt-3 rounded-[1.25rem] border border-panel bg-card/90 p-3 shadow-[0_12px_32px_var(--shadow)] backdrop-blur-sm sm:p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div>
          <span className="block text-xs font-bold uppercase tracking-wide text-foreground/55">
            your notes
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold text-foreground/40">
            {totalSaved > 0
              ? `${totalSaved} ${totalSaved === 1 ? "note" : "notes"} · tap to read or edit`
              : "past notes show up here as you write"}
          </span>
        </div>
        <span className="text-sm text-foreground/45">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="mt-3 border-t border-accent-soft/35 pt-3">
          {archive.length === 0 ? (
            <div className="rounded-xl bg-background/70 px-3 py-6 text-center">
              <p className="text-sm font-semibold text-foreground/55">
                no notes yet
              </p>
              <p className="mt-1 text-xs text-foreground/40">
                notes you write show up here
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
                        {monthCount} {monthCount === 1 ? "note" : "notes"}{" "}
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
                                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-surface/50"
                              >
                                <span className="text-xs font-bold text-foreground/60">
                                  {group.label}
                                </span>
                                <span className="text-[10px] font-semibold text-foreground/40">
                                  {group.entries.length}{" "}
                                  {group.entries.length === 1 ? "note" : "notes"}{" "}
                                  {monthOpen ? "▾" : "▸"}
                                </span>
                              </button>

                              {monthOpen && (
                                <ul className="mt-1 space-y-1.5 pl-1">
                                  {group.entries.map((entry) => {
                                    const entryOpen = expandedEntries.has(
                                      entry.id,
                                    );
                                    const isActive = entry.id === activeNoteId;
                                    const displayText =
                                      isActive && editingText !== undefined
                                        ? editingText
                                        : entry.text;

                                    return (
                                      <li
                                        key={entry.id}
                                        className={`paper-slip rounded-xl border transition ${
                                          isActive
                                            ? "border-accent/50 ring-1 ring-accent/15"
                                            : entry.date === today
                                              ? "border-accent-soft/70"
                                              : "border-accent-soft/40"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2 px-2.5 pt-2">
                                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                                            <p className="text-[10px] font-bold text-foreground/50">
                                              {formatNoteDate(entry.date)}
                                            </p>
                                            <span className="text-[10px] font-semibold text-foreground/35">
                                              {formatNoteTime(entry.updatedAt)}
                                            </span>
                                            {entry.date === today && (
                                              <span className="rounded-full bg-accent-soft/50 px-1.5 py-0.5 text-[9px] font-bold text-foreground/55">
                                                today
                                              </span>
                                            )}
                                          </div>
                                          {pendingDeleteId === entry.id ? (
                                            <EntryDeletePrompt
                                              onConfirm={() => onConfirmDelete?.()}
                                              onCancel={() => onCancelDelete?.()}
                                            />
                                          ) : (
                                            <EntryActionButtons
                                              onEdit={() => onSelectNote?.(entry.id)}
                                              onCopy={() => onCopyNote?.(displayText)}
                                              onDelete={() => onDeleteNote?.(entry.id)}
                                            />
                                          )}
                                        </div>

                                        {entryOpen ? (
                                          <div className="px-2.5 pb-2.5 pt-1">
                                            <div className="max-h-56 overflow-y-auto rounded-lg border border-accent-soft/25 bg-card/90 px-2.5 py-2">
                                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85">
                                                {displayText}
                                              </p>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  toggleEntry(entry.id)
                                                }
                                                className={archivePillClass}
                                              >
                                                Show less
                                                <span aria-hidden>▾</span>
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              toggleEntry(entry.id)
                                            }
                                            className="w-full px-2.5 pb-2.5 pt-1 text-left"
                                            aria-expanded={false}
                                          >
                                            <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm leading-snug text-foreground/70">
                                              {displayText}
                                            </p>
                                            <span className={`mt-2 ${archivePillClass}`}>
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
