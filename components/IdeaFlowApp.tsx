"use client";

import { useCallback, useEffect, useState } from "react";
import { useCloudRefresh } from "@/hooks/useCloudRefresh";
import RodAvatar from "@/components/RodAvatar";
import BottomNav from "@/components/BottomNav";
import MicButton from "@/components/MicButton";
import { type Idea, loadIdeas, saveIdeas } from "@/lib/ideas";
import {
  hydrateFromCloud,
  readLocalJournal,
  readLocalTodos,
  refreshFromCloud,
  scheduleCloudPush,
} from "@/lib/sync-client";

function createId() {
  return crypto.randomUUID();
}

export default function IdeaFlowApp() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [input, setInput] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const displayInput = liveTranscript
    ? input
      ? `${input} ${liveTranscript}`
      : liveTranscript
    : input;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await hydrateFromCloud();
        if (!cancelled) {
          setIdeas(data.ideas);
        }
      } catch {
        if (!cancelled) {
          setIdeas(loadIdeas());
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
      if (data) setIdeas(data.ideas);
    },
    [],
  );

  useCloudRefresh(onCloudRefresh);

  useEffect(() => {
    if (!hydrated) return;
    saveIdeas(ideas);
    scheduleCloudPush(() => ({
      todos: readLocalTodos(),
      ideas,
      journal: readLocalJournal(),
      updatedAt: Date.now(),
    }));
  }, [ideas, hydrated]);

  function addIdea(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    setIdeas((prev) => [
      { id: createId(), text, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
  }

  function appendTranscript(chunk: string) {
    setInput((prev) => (prev ? `${prev} ${chunk}` : chunk));
  }

  function deleteIdea(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
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
            💭 brain blast zone 💭
          </p>
          <h1 className="font-[family-name:var(--font-bangers)] text-[2rem] leading-tight tracking-wide text-foreground sm:text-4xl">
            idea flow
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-foreground/70">
            <span>say it, type it, lock it in</span>
            <RodAvatar size={28} />
          </p>
        </header>

        <section className="rounded-[1.25rem] border border-white/80 bg-card/90 p-3 shadow-[0_16px_40px_var(--shadow)] backdrop-blur-sm sm:p-4">
          <form onSubmit={addIdea} className="space-y-2.5">
            <textarea
              value={displayInput}
              onChange={(e) => {
                setLiveTranscript("");
                setInput(e.target.value);
              }}
              placeholder="hit me with a solid idea…"
              rows={3}
              className="paper-slip w-full resize-none rounded-xl border-2 border-accent-soft/60 px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-xs placeholder:text-foreground/35 focus:border-accent focus:ring-2 focus:ring-accent/15"
              aria-label="New idea"
            />

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95"
              >
                Lock it in
              </button>
              <MicButton
                onTranscript={appendTranscript}
                onInterim={setLiveTranscript}
                size="sm"
              />
            </div>
          </form>

          <div className="my-3 border-t border-accent-soft/35" />

          {!hydrated ? (
            <p className="py-8 text-center text-sm text-foreground/45">
              Loading…
            </p>
          ) : ideas.length === 0 ? (
            <div className="rounded-xl bg-background/70 px-3 py-8 text-center">
              <p className="animate-float-gentle text-2xl">💭</p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground/70">
                nothing here yet… drop a killer idea 🎙️
                <br />
                <span className="text-foreground/50">
                  or type whatever&apos;s on your mind
                </span>
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {ideas.map((idea) => (
                <li
                  key={idea.id}
                  className="paper-slip group animate-pop-in flex items-start gap-2 rounded-xl border border-accent-soft/40 px-2.5 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm leading-snug text-foreground">
                      {idea.text}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-foreground/40">
                      {new Date(idea.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteIdea(idea.id)}
                    aria-label="Delete idea"
                    className="shrink-0 rounded-lg px-1.5 text-xs text-foreground/35 transition active:bg-accent-soft/40 active:text-accent sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
