"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RodAvatar from "@/components/RodAvatar";
import BottomNav from "@/components/BottomNav";
import CrossIcon from "@/components/CrossIcon";
import JournalArchive from "@/components/JournalArchive";
import MicButton from "@/components/MicButton";
import { useCloudRefresh } from "@/hooks/useCloudRefresh";
import { dayBefore, todayString } from "@/lib/dates";
import {
  entryForDate,
  groupJournalArchive,
  loadJournal,
  savedJournalCount,
  saveJournal,
  upsertJournalEntry,
  type JournalEntry,
} from "@/lib/journal";
import {
  hydrateFromCloud,
  journalTombstoneKey,
  readLocalIdeas,
  readLocalTodos,
  readLocalTombstones,
  recordTombstone,
  refreshFromCloud,
  scheduleCloudPush,
} from "@/lib/sync-client";
import { formatJournalDate, verseForDate } from "@/lib/verses";

type SaveStatus = "idle" | "saving" | "saved";

export default function JournalApp() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [today, setToday] = useState(todayString);
  const [hydrated, setHydrated] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [writingDate, setWritingDate] = useState(todayString);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const skipSaveIndicator = useRef(true);
  const prevToday = useRef(today);

  const verse = useMemo(() => verseForDate(today), [today]);
  const archive = useMemo(() => groupJournalArchive(entries), [entries]);
  const totalSaved = useMemo(() => savedJournalCount(entries), [entries]);

  useEffect(() => {
    function refreshToday() {
      const next = todayString();
      setToday((current) => (current === next ? current : next));
    }

    window.addEventListener("focus", refreshToday);
    document.addEventListener("visibilitychange", refreshToday);
    return () => {
      window.removeEventListener("focus", refreshToday);
      document.removeEventListener("visibilitychange", refreshToday);
    };
  }, []);

  useEffect(() => {
    if (prevToday.current === today) return;
    if (writingDate === prevToday.current) {
      setWritingDate(today);
      setShowDatePicker(false);
    }
    prevToday.current = today;
  }, [today, writingDate]);

  const reflection = entryForDate(entries, writingDate)?.text ?? "";
  const isWritingToday = writingDate === today;
  const displayReflection = liveTranscript
    ? reflection
      ? `${reflection} ${liveTranscript}`
      : liveTranscript
    : reflection;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await hydrateFromCloud();
        if (!cancelled) {
          setEntries(data.journal);
        }
      } catch {
        if (!cancelled) {
          setEntries(loadJournal());
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onCloudRefresh = useCallback(
    (data: Awaited<ReturnType<typeof refreshFromCloud>>) => {
      if (data) setEntries(data.journal);
    },
    [],
  );

  useCloudRefresh(onCloudRefresh);

  useEffect(() => {
    if (!hydrated) return;
    saveJournal(entries);
    scheduleCloudPush(() => ({
      todos: readLocalTodos(),
      ideas: readLocalIdeas(),
      journal: entries,
      tombstones: readLocalTombstones(),
      updatedAt: Date.now(),
    }));

    if (skipSaveIndicator.current) {
      skipSaveIndicator.current = false;
      const existing = entryForDate(entries, writingDate)?.text?.trim() ?? "";
      setSaveStatus(existing ? "saved" : "idle");
      return;
    }

    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      const hasText =
        (entryForDate(entries, writingDate)?.text ?? "").trim().length > 0;
      setSaveStatus(hasText ? "saved" : "idle");
    }, 400);

    return () => window.clearTimeout(timer);
  }, [entries, hydrated, writingDate]);

  function selectWritingDate(date: string) {
    if (!date || date > today) return;
    setLiveTranscript("");
    setWritingDate(date);
    skipSaveIndicator.current = true;
    const existing = entryForDate(entries, date)?.text?.trim() ?? "";
    setSaveStatus(existing ? "saved" : "idle");
  }

  function backToToday() {
    selectWritingDate(today);
    setShowDatePicker(false);
  }

  function openMissedDay() {
    if (!isWritingToday) return;
    setShowDatePicker(true);
    selectWritingDate(dayBefore(today));
  }

  function markSaving() {
    if (liveTranscript) return;
    setSaveStatus("saving");
  }

  function updateReflection(text: string) {
    if (!text.trim()) {
      recordTombstone(journalTombstoneKey(writingDate));
    }
    setEntries((prev) => upsertJournalEntry(prev, writingDate, text));
  }

  function handleReflectionChange(text: string) {
    setLiveTranscript("");
    markSaving();
    updateReflection(text);
  }

  function appendTranscript(chunk: string) {
    markSaving();
    setEntries((prev) => {
      const current = entryForDate(prev, writingDate)?.text ?? "";
      return upsertJournalEntry(
        prev,
        writingDate,
        current ? `${current} ${chunk}` : chunk,
      );
    });
    setLiveTranscript("");
  }

  function editFromArchive(date: string) {
    selectWritingDate(date);
    setShowDatePicker(true);
    document.getElementById("journal-reflection")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <div className="safe-px safe-pt relative min-h-dvh overflow-x-hidden pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute -left-20 top-10 h-48 w-48 rounded-full bg-lavender/50 blur-3xl" />
        <div className="animate-float-slower absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-mint/60 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-lg pt-2 sm:pt-4">
        <header className="mb-4 text-center sm:mb-6">
          <p className="mb-1 text-xs font-semibold tracking-wide text-accent sm:text-sm">
            📖 daily verse + vibes 📖
          </p>
          <h1 className="font-[family-name:var(--font-bangers)] text-[2rem] leading-tight tracking-wide text-foreground sm:text-4xl">
            journal
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-foreground/70">
            <span>{formatJournalDate(today)}</span>
            <RodAvatar size={28} />
          </p>
        </header>

        <section className="mb-3 rounded-[1.25rem] border border-white/80 bg-card/90 p-3 shadow-[0_16px_40px_var(--shadow)] backdrop-blur-sm sm:p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <CrossIcon size={12} />
            <p className="text-[10px] font-bold uppercase tracking-wide text-foreground/45">
              verse of the day
            </p>
          </div>
          <blockquote className="paper-slip rounded-xl border border-accent-soft/45 bg-background/70 px-3 py-3">
            <p className="text-sm leading-relaxed text-foreground/85">
              &ldquo;{verse.text}&rdquo;
            </p>
            <footer className="mt-2 text-right text-[11px] font-semibold text-foreground/50">
              — {verse.reference}
            </footer>
          </blockquote>
        </section>

        <section className="rounded-[1.25rem] border border-white/80 bg-card/90 p-3 shadow-[0_16px_40px_var(--shadow)] backdrop-blur-sm sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor="journal-reflection"
              className="text-xs font-bold uppercase tracking-wide text-foreground/55"
            >
              {isWritingToday
                ? "today's reflection"
                : formatJournalDate(writingDate)}
            </label>
            {hydrated && liveTranscript && (
              <span className="text-[10px] font-semibold text-accent animate-pulse">
                listening…
              </span>
            )}
            {hydrated && !liveTranscript && saveStatus === "saving" && (
              <span className="text-[10px] font-semibold text-foreground/45">
                saving…
              </span>
            )}
            {hydrated && !liveTranscript && saveStatus === "saved" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint/45 px-2 py-0.5 text-[10px] font-bold text-forest">
                saved ✓
              </span>
            )}
          </div>
          {!hydrated ? (
            <p className="py-8 text-center text-sm text-foreground/45">
              Loading…
            </p>
          ) : (
            <>
              {(showDatePicker || !isWritingToday) && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={writingDate}
                    max={today}
                    onChange={(e) => selectWritingDate(e.target.value)}
                    className="rounded-lg border border-accent-soft/50 bg-white/80 px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                    aria-label="Pick journal date"
                  />
                  {!isWritingToday && (
                    <button
                      type="button"
                      onClick={backToToday}
                      className="text-[10px] font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      back to today
                    </button>
                  )}
                </div>
              )}
              <textarea
                id="journal-reflection"
                value={displayReflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder={
                  isWritingToday
                    ? "what stood out to you today? prayers, gratitude, notes…"
                    : "catch up on this day…"
                }
                rows={8}
                className={`paper-slip w-full resize-y rounded-xl border-2 px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-xs placeholder:text-foreground/35 focus:border-accent focus:ring-2 focus:ring-accent/15 ${
                  saveStatus === "saved" && !liveTranscript
                    ? "border-forest/35 ring-1 ring-mint/30"
                    : "border-accent-soft/60"
                }`}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-semibold text-foreground/35">
                  {saveStatus === "saved" && (
                    <span>in your journal below ⚡</span>
                  )}
                  {isWritingToday && !showDatePicker && (
                    <>
                      {saveStatus === "saved" && (
                        <span className="text-foreground/25">·</span>
                      )}
                      <button
                        type="button"
                        onClick={openMissedDay}
                        className="text-foreground/45 underline-offset-2 hover:text-foreground/60 hover:underline"
                      >
                        missed a day?
                      </button>
                    </>
                  )}
                  {!isWritingToday && <span>one entry per day</span>}
                </div>
                <MicButton
                  onTranscript={appendTranscript}
                  onInterim={setLiveTranscript}
                  size="sm"
                />
              </div>
            </>
          )}
        </section>

        <JournalArchive
          archive={archive}
          totalSaved={totalSaved}
          today={today}
          onSelectDate={editFromArchive}
        />
      </main>

      <BottomNav />
    </div>
  );
}
