"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import AddTodoForm from "@/components/AddTodoForm";
import CelebrationToast from "@/components/CelebrationToast";
import CompletionFlash from "@/components/CompletionFlash";
import ConfettiBurst from "@/components/ConfettiBurst";
import EssentialsStrip from "@/components/EssentialsStrip";
import SortableTodoList from "@/components/SortableTodoList";
import type { TodoUpdates } from "@/components/TodoItem";
import SiteAvatar from "@/components/SiteAvatar";
import CelebrationAvatar from "@/components/CelebrationAvatar";
import BottomNav from "@/components/BottomNav";
import WeatherForecast from "@/components/WeatherForecast";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { getCategories } from "@/lib/categories";
import { allDoneEncouragement, ALL_DONE_WITH_TODAYS_LIST, pickAllDoneCompliment, pickEncouragement } from "@/lib/encouragements";
import { isTodoDueToday } from "@/lib/dates";
import { hapticComplete, hapticSelection } from "@/lib/haptics";
import {
  allEssentialsDoneToday,
  completePermanentTodo,
  ensureEssentials,
  isPermanentTodo,
  isRegularTodo,
  pendingEssentials,
  uncompletePermanentTodo,
} from "@/lib/essentials";
import { migrateTodos, reorderTodos, sortByDueDate } from "@/lib/migrate";
import { mergeSyncData } from "@/lib/sync-merge";
import {
  remainingTodayRegularCount,
  todayRegularTodos,
} from "@/lib/today-scope";
import { formatSiteDecor, getSiteConfig } from "@/lib/site";
import { useCloudRefresh } from "@/hooks/useCloudRefresh";
import {
  hydrateFromCloud,
  readLocalIdeas,
  readLocalJournal,
  readLocalTombstones,
  refreshFromCloud,
  pushSyncNow,
  scheduleCloudPush,
  touchSyncMeta,
  writeLocalIdeas,
  writeLocalJournal,
  writeLocalTodos,
  buildLocalSnapshot,
} from "@/lib/sync-client";
import type {
  Category,
  CategoryFilter,
  StatusFilter,
  Todo,
} from "@/lib/types";

function createId() {
  return crypto.randomUUID();
}

const CHECK_FEEDBACK_MS = 280;
const COMPLETE_FLY_MS = 340;

type Celebration = {
  message: string;
  emoji: string;
  seed: number;
};

function localTodosRevision(todos: Todo[]) {
  if (todos.length === 0) return 0;
  return Math.max(...todos.map((todo) => todo.updatedAt ?? todo.createdAt));
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<Category>("personal");
  const [dueDate, setDueDate] = useState("");
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [hydrated, setHydrated] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [completionFlash, setCompletionFlash] = useState<{
    message: string;
    emoji: string;
  } | null>(null);
  const [allDoneCompliment, setAllDoneCompliment] = useState<string | null>(null);
  const [addedPrompt, setAddedPrompt] = useState(false);
  const [addedPromptKey, setAddedPromptKey] = useState(0);
  const lastToggleRef = useRef<{
    id: string;
    expectedCompleted: boolean;
    at: number;
  } | null>(null);
  const lastEditRef = useRef<{ at: number; todoId: string } | null>(null);
  const todosRef = useRef<Todo[]>([]);

  function persistTodos(next: Todo[], syncNow = false) {
    todosRef.current = next;
    writeLocalTodos(next);
    touchSyncMeta();
    const payload = {
      todos: next,
      ideas: readLocalIdeas(),
      journal: readLocalJournal(),
      tombstones: readLocalTombstones(),
      updatedAt: Date.now(),
    };
    if (syncNow) {
      pushSyncNow(payload);
    } else {
      scheduleCloudPush(() => payload);
    }
  }

  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await hydrateFromCloud();
        if (!cancelled) {
          setTodos(data.todos);
        }
      } catch {
        if (!cancelled) {
          setTodos(ensureEssentials([]));
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
      if (!data) return;

      const last = lastToggleRef.current;
      const localTodo = last
        ? todosRef.current.find((t) => t.id === last.id)
        : undefined;
      const mergedTodo = last
        ? data.todos.find((t) => t.id === last.id)
        : undefined;

      if (
        last != null &&
        Date.now() - last.at < 3000 &&
        localTodo?.completed === last.expectedCompleted &&
        mergedTodo?.completed !== last.expectedCompleted
      ) {
        return;
      }

      const lastEdit = lastEditRef.current;
      if (lastEdit != null && Date.now() - lastEdit.at < 15_000) {
        writeLocalTodos(todosRef.current);
        return;
      }

      const localSnapshot = buildLocalSnapshot();
      const merged = mergeSyncData(
        {
          ...localSnapshot,
          todos: todosRef.current,
          updatedAt: Math.max(
            localSnapshot.updatedAt,
            localTodosRevision(todosRef.current),
          ),
        },
        data,
      );

      todosRef.current = merged.todos;
      writeLocalTodos(merged.todos);
      setTodos(merged.todos);
    },
    [],
  );

  useCloudRefresh(onCloudRefresh);

  useEffect(() => {
    if (!hydrated) return;
    if (lastEditRef.current && Date.now() - lastEditRef.current.at < 15_000) {
      return;
    }
    const handle = window.setTimeout(() => {
      writeLocalTodos(todos);
      scheduleCloudPush(() => ({
        todos,
        ideas: readLocalIdeas(),
        journal: readLocalJournal(),
        tombstones: readLocalTombstones(),
        updatedAt: Date.now(),
      }));
    }, 0);
    return () => window.clearTimeout(handle);
  }, [todos, hydrated]);

  const sortedTodos = useMemo(() => sortByDueDate(todos), [todos]);

  const pendingRituals = useMemo(
    () => pendingEssentials(sortedTodos),
    [sortedTodos],
  );

  const ritualsDone = useMemo(
    () => allEssentialsDoneToday(sortedTodos),
    [sortedTodos],
  );

  const regularTodos = useMemo(
    () => sortedTodos.filter(isRegularTodo),
    [sortedTodos],
  );

  const filteredTodos = useMemo(() => {
    return regularTodos.filter((todo) => {
      if (categoryFilter !== "all" && todo.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === "active") {
        return !todo.completed || completingId === todo.id;
      }
      if (statusFilter === "completed") return todo.completed;
      return true;
    });
  }, [regularTodos, statusFilter, categoryFilter, completingId]);

  const activeCount = regularTodos.filter(
    (t) => !t.completed || completingId === t.id,
  ).length;
  const completedCount = regularTodos.filter((t) => t.completed).length;
  const ritualCount = pendingRituals.length;

  const todayTodos = useMemo(
    () => todayRegularTodos(regularTodos),
    [regularTodos],
  );
  const todayActiveCount = todayTodos.filter(
    (t) => !t.completed || completingId === t.id,
  ).length;
  const allDoneForToday =
    todayTodos.length > 0 && todayActiveCount === 0;

  useEffect(() => {
    if (!hydrated) return;
    if (allDoneForToday) {
      setAllDoneCompliment((current) => current ?? pickAllDoneCompliment());
    } else {
      setAllDoneCompliment(null);
    }
  }, [hydrated, allDoneForToday]);

  const dismissCelebration = useCallback(() => setCelebration(null), []);
  const dismissCompletionFlash = useCallback(() => setCompletionFlash(null), []);
  const dismissAddedPrompt = useCallback(() => setAddedPrompt(false), []);

  function celebrate(wasAllDoneForToday: boolean) {
    const picked = wasAllDoneForToday ? allDoneEncouragement() : pickEncouragement();
    if (wasAllDoneForToday) {
      setAllDoneCompliment(picked.message);
      setCelebration({
        ...picked,
        seed: Date.now(),
      });
    } else {
      setCompletionFlash(picked);
    }
  }

  function addTodo(
    e: React.FormEvent,
    extras?: { reminderTime: string | null },
  ) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const nextReminderTime = extras?.reminderTime ?? reminderTime;

    const maxOrder = todos.reduce((max, t) => Math.max(max, t.order), -1);

    setTodos((prev) => [
      ...prev,
      {
        id: createId(),
        text,
        completed: false,
        createdAt: Date.now(),
        dueDate: dueDate || null,
        reminderTime:
          dueDate && nextReminderTime ? nextReminderTime : null,
        lastRemindedDate: null,
        category,
        order: maxOrder + 1,
      },
    ]);
    setInput("");
    setDueDate("");
    setReminderTime(null);
    hapticSelection();
    setAddedPromptKey((key) => key + 1);
    setAddedPrompt(true);
  }

  function toggleTodo(id: string) {
    const target = todos.find((t) => t.id === id);
    if (!target || completingId === id) return;

    if (target.permanent) {
      if (target.completed) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? uncompletePermanentTodo(t) : t,
          ),
        );
        return;
      }

      setCompletingId(id);
      lastToggleRef.current = { id, expectedCompleted: true, at: Date.now() };
      hapticComplete();
      window.setTimeout(() => {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? completePermanentTodo(t) : t,
          ),
        );
        window.setTimeout(() => setCompletingId(null), COMPLETE_FLY_MS);
      }, CHECK_FEEDBACK_MS);
      return;
    }

    if (target.completed) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: false } : t)),
      );
      return;
    }

    setCompletingId(id);
    lastToggleRef.current = { id, expectedCompleted: true, at: Date.now() };
    hapticComplete();
    const wasAllDoneForToday =
      isTodoDueToday(target) &&
      remainingTodayRegularCount(
        todos.map((t) => (t.id === id ? { ...t, completed: true } : t)),
      ) === 0;

    window.setTimeout(() => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: true } : t)),
      );

      if (!wasAllDoneForToday) {
        startTransition(() => celebrate(false));
      }

      window.setTimeout(() => {
        setCompletingId(null);
        if (wasAllDoneForToday) {
          startTransition(() => celebrate(true));
        }
      }, COMPLETE_FLY_MS);
    }, CHECK_FEEDBACK_MS);
  }

  function deleteTodo(id: string) {
    setTodos((prev) =>
      prev.filter((t) => t.id !== id || isPermanentTodo(t)),
    );
  }

  function updateTodo(id: string, updates: TodoUpdates) {
    const target = todosRef.current.find((t) => t.id === id);
    if (!target || isPermanentTodo(target)) return;

    const reminderChanged = updates.reminderTime !== (target.reminderTime ?? null);
    const dueDateChanged = updates.dueDate !== target.dueDate;
    const now = Date.now();
    lastEditRef.current = { at: now, todoId: id };

    const next = todosRef.current.map((t) =>
      t.id === id
        ? {
            ...t,
            ...updates,
            updatedAt: now,
            ...(reminderChanged || dueDateChanged
              ? { lastRemindedDate: null }
              : {}),
          }
        : t,
    );

    setTodos(next);
    persistTodos(next, true);
  }

  function clearCompleted() {
    setTodos((prev) =>
      prev.filter((t) => !t.completed || isPermanentTodo(t)),
    );
  }

  function handleReorder(activeId: string, overId: string) {
    setTodos((prev) => reorderTodos(prev, activeId, overId));
  }

  const filterButtons: { key: StatusFilter; label: string; count?: number }[] =
    [
      { key: "active", label: "Active", count: activeCount },
      { key: "completed", label: "Done", count: completedCount },
      { key: "all", label: "All", count: regularTodos.length },
    ];

  const site = getSiteConfig();

  return (
    <div className="safe-px safe-pt relative min-h-full overflow-x-hidden pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute -left-20 top-10 h-56 w-56 rounded-full bg-accent-soft/60 blur-3xl" />
        <div className="animate-float-slower absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-mint/70 blur-3xl" />
        <div className="animate-float-slow absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-lavender/50 blur-3xl" />
      </div>

      {celebration && <ConfettiBurst seed={celebration.seed} />}

      <main className="relative mx-auto w-full max-w-lg pb-2 pt-2 sm:pt-4">
        <header className="mb-5 text-center sm:mb-8">
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-accent sm:mb-2 sm:text-sm">
            {formatSiteDecor(site.homeTagline, site.homeAvatarEmoji)}
          </p>
          <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            to-do(s)
          </h1>
          <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm text-foreground/70 sm:mt-3 sm:text-base">
            <span>{site.homeSubtitle}</span>
            <SiteAvatar size={34} />
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5">
            <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border-2 border-accent-soft/50 bg-card/80 px-3.5 py-2 shadow-sm backdrop-blur-sm sm:gap-3 sm:px-4">
              <span className="animate-float-gentle text-2xl" aria-hidden>
                ⚡
              </span>
              <p className="text-xs font-semibold text-foreground/75 sm:text-sm">
                {allDoneForToday
                  ? ALL_DONE_WITH_TODAYS_LIST
                  : todayTodos.length > 0
                    ? `${todayActiveCount} for today left`
                    : activeCount === 0
                      ? "All tucked into their boxes!"
                      : `${activeCount} bit${activeCount === 1 ? "" : "s"} left`}
              </p>
            </div>

            {ritualCount > 0 && (
              <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border-2 border-accent-soft/50 bg-card/80 px-3.5 py-2 shadow-sm backdrop-blur-sm sm:gap-3 sm:px-4">
                <span className="animate-float-gentle text-xl" aria-hidden>
                  ⭐
                </span>
                <p className="text-xs font-semibold text-foreground/75 sm:text-sm">
                  {ritualCount} ritual{ritualCount === 1 ? "" : "s"} left
                </p>
              </div>
            )}

            {ritualsDone && ritualCount === 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-soft/30 bg-background/60 px-3 py-1.5 text-[11px] font-semibold text-foreground/45">
                rituals done ✓
              </div>
            )}
          </div>
        </header>

        <div className="mb-3 sm:mb-4">
          <WeatherForecast />
        </div>

        <PushNotificationToggle />

        <section className="rounded-2xl border border-panel bg-card/90 p-3 shadow-[0_12px_40px_var(--shadow)] backdrop-blur-sm sm:p-4">
          <AddTodoForm
            input={input}
            category={category}
            dueDate={dueDate}
            reminderTime={reminderTime}
            onInputChange={setInput}
            onCategoryChange={setCategory}
            onDueDateChange={setDueDate}
            onReminderTimeChange={setReminderTime}
            showAddedPrompt={addedPrompt}
            addedPromptKey={addedPromptKey}
            onAddedPromptDone={dismissAddedPrompt}
            onSubmit={addTodo}
          />

          <div className="my-4 border-t border-accent-soft/40 sm:my-5" />

          <div className="scroll-chips -mx-0.5 mb-3 flex gap-2 overflow-x-auto pb-0.5 sm:mb-4 sm:flex-wrap sm:overflow-visible">
            {filterButtons.map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 sm:text-sm ${
                  statusFilter === key
                    ? "bg-lavender text-foreground shadow-sm dark:bg-accent-soft/40 dark:shadow-none"
                    : "bg-background text-foreground/60 active:bg-accent-soft/30 dark:text-foreground/65"
                }`}
              >
                {label}
                {count !== undefined && count > 0 && (
                  <span className="ml-1.5 opacity-70">({count})</span>
                )}
              </button>
            ))}
          </div>

          <div className="scroll-chips -mx-0.5 mb-3 flex gap-2 overflow-x-auto pb-0.5 sm:mb-4 sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition active:scale-95 ${
                categoryFilter === "all"
                  ? "bg-kraft text-foreground shadow-sm dark:bg-accent-soft/35"
                  : "bg-background text-foreground/55 active:bg-kraft/60 dark:text-foreground/65"
              }`}
            >
              📦 All boxes
            </button>
            {getCategories().map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition active:scale-95 ${
                  categoryFilter === cat.id
                    ? `${cat.pill} ring-2 ring-surface dark:ring-card`
                    : "bg-background text-foreground/55 active:bg-accent-soft/25 dark:text-foreground/65"
                }`}
              >
                {cat.emoji} {cat.boxLabel}
              </button>
            ))}
          </div>

          {!hydrated ? (
            <p className="py-10 text-center text-foreground/50">Loading…</p>
          ) : filteredTodos.length === 0 ? (
            <div className="flex min-h-[10rem] flex-col items-center justify-center rounded-2xl bg-background/70 px-3 py-10 text-center sm:px-4 sm:py-12">
              {celebration && statusFilter === "active" ? (
                <CelebrationToast
                  message={celebration.message}
                  onDone={dismissCelebration}
                />
              ) : (
                <>
                  {statusFilter === "active" ? (
                    <div className="flex justify-center">
                      <CelebrationAvatar size={100} />
                    </div>
                  ) : (
                    <p className="animate-float-gentle text-3xl">{site.emptyCompletedEmoji}</p>
                  )}
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground/80 sm:text-base">
                    {statusFilter === "completed"
                      ? "Nothing checked off yet — you've got this!"
                      : statusFilter === "active"
                        ? allDoneCompliment ?? ALL_DONE_WITH_TODAYS_LIST
                        : "Your box is empty. Add something sweet above."}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="relative pb-2">
              {allDoneForToday && statusFilter === "active" && (
                <div className="mb-3 flex flex-col items-center rounded-2xl bg-background/70 px-3 py-4 text-center">
                  <CelebrationAvatar size={72} />
                  <p className="mt-2 text-sm font-semibold text-foreground/80">
                    {allDoneCompliment ?? ALL_DONE_WITH_TODAYS_LIST}
                  </p>
                </div>
              )}
              <SortableTodoList
                todos={filteredTodos}
                completingId={completingId}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
                onReorder={handleReorder}
              />
              {completionFlash && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pt-2">
                  <CompletionFlash
                    message={completionFlash.message}
                    emoji={completionFlash.emoji}
                    onDone={dismissCompletionFlash}
                  />
                </div>
              )}
            </div>
          )}

          {hydrated && pendingRituals.length > 0 && (
            <div className="mt-4 border-t border-accent-soft/30 pt-3">
              <EssentialsStrip
                todos={pendingRituals}
                completingId={completingId}
                onToggle={toggleTodo}
              />
            </div>
          )}

          {completedCount > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-accent-soft/40 pt-3.5 text-sm sm:mt-5 sm:pt-4">
              <span className="min-w-0 text-xs text-foreground/60 sm:text-sm">
                {allDoneForToday
                  ? `${ALL_DONE_WITH_TODAYS_LIST} ✓`
                  : activeCount === 0
                    ? site.allDoneFooter
                    : `${activeCount} left to go`}
              </span>
              <button
                type="button"
                onClick={clearCompleted}
                className="touch-target shrink-0 font-semibold text-accent transition active:text-accent-deep"
              >
                Clear done
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
