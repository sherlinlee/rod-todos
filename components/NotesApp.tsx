"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SiteAvatar from "@/components/SiteAvatar";
import BottomNav from "@/components/BottomNav";
import EntryDeletePrompt from "@/components/EntryDeletePrompt";
import EntryActionButtons from "@/components/EntryActionButtons";
import NotesArchive from "@/components/NotesArchive";
import MicButton from "@/components/MicButton";
import { useCloudRefresh } from "@/hooks/useCloudRefresh";
import { copyText } from "@/lib/copy";
import { dayBefore, formatNoteDate, todayString } from "@/lib/dates";
import {
  appendJournalEntry,
  deleteJournalEntry,
  entriesForDate,
  entryById,
  groupJournalArchive,
  loadJournal,
  savedJournalCount,
  saveJournal,
  updateJournalEntry,
  type JournalEntry,
} from "@/lib/journal";
import {
  applyCloudData,
  hydrateFromCloud,
  journalEntryTombstoneKey,
  pushSyncNow,
  readLocalIdeas,
  readLocalTodos,
  readLocalTombstones,
  recordTombstone,
  refreshFromCloud,
  scheduleCloudPush,
  touchSyncMeta,
} from "@/lib/sync-client";
import { getSiteConfig } from "@/lib/site";

type SaveStatus = "idle" | "saving" | "saved";

export default function NotesApp() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [today, setToday] = useState(todayString);
  const [hydrated, setHydrated] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [writingDate, setWritingDate] = useState(todayString);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const skipSaveIndicator = useRef(true);
  const prevToday = useRef(today);
  const [draftText, setDraftText] = useState("");
  const isEditingRef = useRef(false);
  const isFocusedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const activeNoteIdRef = useRef<string | null>(null);
  const draftTextRef = useRef("");
  const flushDraftRef = useRef<() => void>(() => {});

  const site = getSiteConfig();
  const archive = useMemo(() => groupJournalArchive(entries), [entries]);
  const totalSaved = useMemo(() => savedJournalCount(entries), [entries]);
  const notesForDay = useMemo(
    () => entriesForDate(entries, writingDate),
    [entries, writingDate],
  );

  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    draftTextRef.current = draftText;
  }, [draftText]);

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

  const isWritingToday = writingDate === today;
  const displayNote = liveTranscript
    ? draftText
      ? `${draftText}${draftText.endsWith(" ") ? "" : " "}${liveTranscript}`
      : liveTranscript
    : draftText;

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

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const onCloudRefresh = useCallback(
    (data: Awaited<ReturnType<typeof refreshFromCloud>>) => {
      if (!data || isEditingRef.current || isFocusedRef.current) return;

      const draft = draftTextRef.current;
      const active = activeNoteIdRef.current;

      if (!active && draft.trim()) return;

      if (active) {
        const remote = entryById(data.journal, active)?.text ?? "";
        if (draft.trim() && draft !== remote) return;
      }

      applyCloudData(data);
      setEntries(data.journal);
      if (active) {
        setDraftText(entryById(data.journal, active)?.text ?? draft);
      }
    },
    [],
  );

  useCloudRefresh(onCloudRefresh);

  useEffect(() => {
    if (!hydrated) return;
    saveJournal(entries);
    touchSyncMeta();
    scheduleCloudPush(() => ({
      todos: readLocalTodos(),
      ideas: readLocalIdeas(),
      journal: entries,
      tombstones: readLocalTombstones(),
      updatedAt: Date.now(),
    }));

    if (skipSaveIndicator.current) {
      skipSaveIndicator.current = false;
      setSaveStatus("idle");
      return;
    }

    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      setSaveStatus("saved");
    }, 400);

    return () => window.clearTimeout(timer);
  }, [entries, hydrated]);

  function persistDraft(text: string, date: string, noteId: string | null) {
    if (!text.trim()) {
      setSaveStatus(noteId ? "saved" : "idle");
      return;
    }

    if (noteId) {
      setEntries((prev) => {
        const next = updateJournalEntry(prev, noteId, date, text);
        saveJournal(next);
        return next;
      });
      return;
    }

    setEntries((prev) => {
      const { entries: next, entry } = appendJournalEntry(prev, date, text);
      saveJournal(next);
      setActiveNoteId(entry.id);
      activeNoteIdRef.current = entry.id;
      return next;
    });
  }

  function flushDraft() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    persistDraft(draftText, writingDate, activeNoteIdRef.current);
    isEditingRef.current = false;
  }

  flushDraftRef.current = flushDraft;

  useEffect(() => {
    function handlePageHide() {
      flushDraftRef.current();
    }

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  function resetComposer() {
    setActiveNoteId(null);
    activeNoteIdRef.current = null;
    setDraftText("");
    draftTextRef.current = "";
    setLiveTranscript("");
    setSaveStatus("idle");
    skipSaveIndicator.current = true;
  }

  function startNewNote() {
    flushDraft();
    resetComposer();
  }

  function selectWritingDate(date: string) {
    if (!date || date > today) return;
    flushDraft();
    resetComposer();
    setWritingDate(date);
  }

  function backToToday() {
    selectWritingDate(today);
    setShowDatePicker(false);
  }

  function openPastDay() {
    if (!isWritingToday) return;
    setShowDatePicker(true);
    selectWritingDate(dayBefore(today));
  }

  function markSaving() {
    if (liveTranscript) return;
    setSaveStatus("saving");
  }

  function handleNoteChange(text: string) {
    setLiveTranscript("");
    isEditingRef.current = true;
    setDraftText(text);
    draftTextRef.current = text;
    markSaving();

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      persistDraft(text, writingDate, activeNoteIdRef.current);
      isEditingRef.current = false;
      saveTimerRef.current = null;
    }, 500);
  }

  function handleNoteBlur() {
    isFocusedRef.current = false;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    let textToSave = draftText;
    if (liveTranscript) {
      textToSave = draftText
        ? `${draftText}${draftText.endsWith(" ") ? "" : " "}${liveTranscript}`
        : liveTranscript;
      setLiveTranscript("");
      setDraftText(textToSave);
    }

    const noteId = activeNoteIdRef.current;
    if (!textToSave.trim() && noteId) {
      const saved = entryById(entries, noteId);
      if (saved) {
        setDraftText(saved.text);
        draftTextRef.current = saved.text;
      }
      setSaveStatus("saved");
      isEditingRef.current = false;
      return;
    }

    persistDraft(textToSave, writingDate, noteId);
    isEditingRef.current = false;
  }

  function handleNoteFocus() {
    isFocusedRef.current = true;
  }

  function appendTranscript(chunk: string) {
    markSaving();
    isEditingRef.current = true;
    const nextText = draftText
      ? `${draftText}${draftText.endsWith(" ") ? "" : " "}${chunk}`
      : chunk;
    setDraftText(nextText);
    persistDraft(nextText, writingDate, activeNoteIdRef.current);
    setLiveTranscript("");
    isEditingRef.current = false;
  }

  function selectNote(id: string) {
    flushDraft();
    const note = entryById(entries, id);
    if (!note) return;
    setActiveNoteId(id);
    activeNoteIdRef.current = id;
    setWritingDate(note.date);
    setDraftText(note.text);
    draftTextRef.current = note.text;
    setShowDatePicker(note.date !== today);
    skipSaveIndicator.current = true;
    setSaveStatus("saved");
    window.requestAnimationFrame(() => {
      const textarea = document.getElementById("notes-editor");
      textarea?.scrollIntoView({ behavior: "smooth", block: "center" });
      textarea?.focus({ preventScroll: true });
    });
  }

  function syncNotesNow(journal: JournalEntry[]) {
    saveJournal(journal);
    pushSyncNow({
      todos: readLocalTodos(),
      ideas: readLocalIdeas(),
      journal,
      tombstones: readLocalTombstones(),
      updatedAt: Date.now(),
    });
  }

  function requestDeleteNote(id: string) {
    setPendingDeleteId(id);
  }

  function confirmDeleteNote() {
    const id = pendingDeleteId;
    if (!id) return;
    setPendingDeleteId(null);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    isEditingRef.current = false;
    isFocusedRef.current = false;
    setLiveTranscript("");
    skipSaveIndicator.current = true;

    recordTombstone(journalEntryTombstoneKey(id));

    setEntries((prev) => {
      const next = deleteJournalEntry(prev, id);
      syncNotesNow(next);
      return next;
    });

    if (activeNoteIdRef.current === id) {
      resetComposer();
    }
  }

  function cancelDeleteNote() {
    setPendingDeleteId(null);
  }

  function copyNote(text: string) {
    void copyText(text);
  }

  const hasDraftContent = Boolean(draftText.trim());
  const composerLabel = activeNoteId
    ? "edit note"
    : isWritingToday
      ? "new note"
      : formatNoteDate(writingDate);

  return (
    <div className="safe-px safe-pt relative min-h-full overflow-x-hidden pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute -left-20 top-10 h-48 w-48 rounded-full bg-lavender/50 blur-3xl" />
        <div className="animate-float-slower absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-mint/60 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-lg pt-2 sm:pt-4">
        <header className="mb-4 text-center sm:mb-6">
          <h1 className="text-[1.75rem] font-extrabold leading-tight text-foreground sm:text-4xl">
            notes 📝
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-foreground/70">
            <span>{formatNoteDate(today)}</span>
            <SiteAvatar size={28} />
          </p>
        </header>

        <section className="rounded-[1.25rem] border border-panel bg-card/90 p-3 shadow-[0_16px_40px_var(--shadow)] backdrop-blur-sm sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor="notes-editor"
              className="text-xs font-bold uppercase tracking-wide text-foreground/55"
            >
              {composerLabel}
            </label>
            <div className="flex items-center gap-2">
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
              {hydrated && (activeNoteId || hasDraftContent) && (
                <button
                  type="button"
                  onClick={startNewNote}
                  className="rounded-full bg-accent-soft/45 px-2 py-0.5 text-[10px] font-bold text-accent"
                >
                  + new note
                </button>
              )}
            </div>
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
                    className="rounded-lg border border-accent-soft/50 bg-surface/80 px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                    aria-label="Pick note date"
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
                id="notes-editor"
                value={displayNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                onFocus={handleNoteFocus}
                onBlur={handleNoteBlur}
                placeholder="jot something down…"
                rows={8}
                className="paper-slip w-full resize-y rounded-xl border border-accent-soft/60 px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-xs placeholder:text-foreground/35 focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-semibold text-foreground/35">
                  {saveStatus === "saved" && (
                    <span>{site.notesSavedHint}</span>
                  )}
                  {isWritingToday && !showDatePicker && (
                    <>
                      {saveStatus === "saved" && (
                        <span className="text-foreground/25">·</span>
                      )}
                      <button
                        type="button"
                        onClick={openPastDay}
                        className="text-foreground/45 underline-offset-2 hover:text-foreground/60 hover:underline"
                      >
                        another day?
                      </button>
                    </>
                  )}
                  {activeNoteId &&
                    (pendingDeleteId === activeNoteId ? (
                      <EntryDeletePrompt
                        onConfirm={confirmDeleteNote}
                        onCancel={cancelDeleteNote}
                      />
                    ) : (
                      <EntryActionButtons
                        onCopy={() =>
                          copyNote(
                            draftText.trim() ||
                              entryById(entries, activeNoteId)?.text ||
                              "",
                          )
                        }
                        onDelete={() => requestDeleteNote(activeNoteId)}
                      />
                    ))}
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

        {hydrated && notesForDay.length > 0 && (
          <section className="mt-3 rounded-[1.25rem] border border-panel bg-card/90 p-3 shadow-[0_12px_32px_var(--shadow)] backdrop-blur-sm sm:p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/55">
              {isWritingToday ? "today" : formatNoteDate(writingDate)} ·{" "}
              {notesForDay.length}{" "}
              {notesForDay.length === 1 ? "note" : "notes"}
            </p>
            <ul className="space-y-1.5">
              {notesForDay.map((note) => {
                const isActive = note.id === activeNoteId;
                const preview =
                  isActive && draftText.trim() ? draftText : note.text;

                return (
                  <li
                    key={note.id}
                    className={`paper-slip rounded-xl border transition ${
                      isActive
                        ? "border-accent/50 ring-1 ring-accent/15"
                        : "border-accent-soft/45"
                    }`}
                  >
                    <div className="flex items-start gap-1 px-2 py-2">
                      <button
                        type="button"
                        onClick={() => selectNote(note.id)}
                        className="min-w-0 flex-1 px-1 py-0.5 text-left"
                      >
                        <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-snug text-foreground/80">
                          {preview}
                        </p>
                      </button>
                      {pendingDeleteId === note.id ? (
                        <EntryDeletePrompt
                          onConfirm={confirmDeleteNote}
                          onCancel={cancelDeleteNote}
                        />
                      ) : (
                        <EntryActionButtons
                          onEdit={() => selectNote(note.id)}
                          onCopy={() => copyNote(preview)}
                          onDelete={() => requestDeleteNote(note.id)}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <NotesArchive
          archive={archive}
          totalSaved={totalSaved}
          today={today}
          activeNoteId={activeNoteId}
          editingText={draftText}
          pendingDeleteId={pendingDeleteId}
          onSelectNote={selectNote}
          onCopyNote={copyNote}
          onDeleteNote={requestDeleteNote}
          onConfirmDelete={confirmDeleteNote}
          onCancelDelete={cancelDeleteNote}
        />
      </main>

      <BottomNav />
    </div>
  );
}
