import type { Idea } from "@/lib/ideas";
import {
  loadJournal,
  normalizeJournalEntries,
  saveJournal,
  type JournalEntry,
} from "@/lib/journal";
import { ensureEssentials } from "@/lib/essentials";
import { migrateTodos } from "@/lib/migrate";
import {
  hasUserContent,
  hasUserTodos,
  mergeSyncData,
  needsCloudPush,
} from "@/lib/sync-merge";
import {
  type RodSyncData,
  SYNC_META_KEY,
  type SyncMeta,
  type SyncTombstone,
} from "@/lib/sync-types";
import type { Todo } from "@/lib/types";

const TODOS_KEY = "to-dos-items-v2";
const LEGACY_TODOS_KEY = "to-dos-items";
const IDEAS_KEY = "to-dos-ideas";
const TOMBSTONES_KEY = "rod-sync-tombstones";

export function readLocalTodos(): Todo[] {
  try {
    const saved =
      localStorage.getItem(TODOS_KEY) ?? localStorage.getItem(LEGACY_TODOS_KEY);
    if (!saved) return ensureEssentials([]);
    return ensureEssentials(migrateTodos(JSON.parse(saved)));
  } catch {
    return ensureEssentials([]);
  }
}

export function writeLocalTodos(todos: Todo[]) {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export function readLocalIdeas(): Idea[] {
  try {
    const raw = localStorage.getItem(IDEAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Idea[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (idea) => typeof idea.id === "string" && typeof idea.text === "string",
    );
  } catch {
    return [];
  }
}

export function writeLocalIdeas(ideas: Idea[]) {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
}

export function readLocalJournal(): JournalEntry[] {
  return loadJournal();
}

export function writeLocalJournal(journal: JournalEntry[]) {
  saveJournal(journal);
}

export function readLocalTombstones(): SyncTombstone[] {
  try {
    const raw = localStorage.getItem(TOMBSTONES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SyncTombstone[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) => typeof t.key === "string" && typeof t.deletedAt === "number",
    );
  } catch {
    return [];
  }
}

export function writeLocalTombstones(tombstones: SyncTombstone[]) {
  localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(tombstones));
}

export function recordTombstone(key: string) {
  const deletedAt = Date.now();
  const next = [
    ...readLocalTombstones().filter((t) => t.key !== key),
    { key, deletedAt },
  ];
  writeLocalTombstones(next);
  writeSyncMeta({ updatedAt: deletedAt });
}

export function todoTombstoneKey(id: string) {
  return `todo:${id}`;
}

export function ideaTombstoneKey(id: string) {
  return `idea:${id}`;
}

export function journalTombstoneKey(date: string) {
  return `journal:${date}`;
}

/** Per-note tombstone (multi-note journal). */
export function journalEntryTombstoneKey(id: string) {
  return `journal-entry:${id}`;
}

function readSyncMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    if (!raw) return { updatedAt: 0 };
    const parsed = JSON.parse(raw) as SyncMeta;
    return typeof parsed.updatedAt === "number"
      ? parsed
      : { updatedAt: 0 };
  } catch {
    return { updatedAt: 0 };
  }
}

function writeSyncMeta(meta: SyncMeta) {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  window.location.href = "/login";
}

export async function fetchCloudSync(): Promise<RodSyncData | null> {
  try {
    const res = await fetch("/api/sync", {
      cache: "no-store",
      credentials: "include",
    });
    if (res.status === 401) {
      redirectToLogin();
      return null;
    }
    if (!res.ok) return null;
    const json = (await res.json()) as {
      ok: boolean;
      data: RodSyncData | null;
    };
    if (!json.ok || !json.data) return null;
    return {
      todos: ensureEssentials(migrateTodos(json.data.todos)),
      ideas: json.data.ideas,
      journal: normalizeJournalEntries(json.data.journal ?? []),
      tombstones: json.data.tombstones ?? [],
      updatedAt: json.data.updatedAt,
    };
  } catch {
    return null;
  }
}

export async function pushCloudSync(data: RodSyncData): Promise<boolean> {
  try {
    const res = await fetch("/api/sync", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      redirectToLogin();
      return false;
    }
    if (!res.ok) return false;
    writeSyncMeta({ updatedAt: data.updatedAt });
    return true;
  } catch {
    return false;
  }
}

let pushChain: Promise<boolean> = Promise.resolve(true);

function localRevision(local: RodSyncData): number {
  return Math.max(readSyncMeta().updatedAt, local.updatedAt);
}

async function pushCloudSyncMerged(local: RodSyncData): Promise<boolean> {
  pushChain = pushChain.then(async () => {
    const cloud = await fetchCloudSync();
    const localWithRevision = { ...local, updatedAt: localRevision(local) };

    if (!cloud) {
      if (!hasUserContent(localWithRevision)) return true;
      const payload = { ...localWithRevision, updatedAt: Date.now() };
      applyCloudData(payload);
      return pushCloudSync(payload);
    }

    const merged = mergeSyncData(localWithRevision, cloud);

    if (
      !hasUserTodos(merged) &&
      hasUserTodos(cloud) &&
      !hasUserTodos(localWithRevision)
    ) {
      applyCloudData(merged);
      if (!needsCloudPush(merged, cloud)) return true;
      const payload = { ...merged, updatedAt: Date.now() };
      return pushCloudSync(payload);
    }

    if (!needsCloudPush(merged, cloud)) {
      applyCloudData(merged);
      return true;
    }

    const payload = { ...merged, updatedAt: Date.now() };
    applyCloudData(payload);
    return pushCloudSync(payload);
  });

  return pushChain;
}

export function touchSyncMeta() {
  writeSyncMeta({ updatedAt: Date.now() });
}

export function pushSyncNow(data: RodSyncData) {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  void pushCloudSyncMerged({
    ...data,
    tombstones: data.tombstones ?? readLocalTombstones(),
    updatedAt: Date.now(),
  });
}

export function buildLocalSnapshot(): RodSyncData {
  return {
    todos: readLocalTodos(),
    ideas: readLocalIdeas(),
    journal: readLocalJournal(),
    tombstones: readLocalTombstones(),
    updatedAt: readSyncMeta().updatedAt,
  };
}

export function applyCloudData(data: RodSyncData) {
  writeLocalTodos(data.todos);
  writeLocalIdeas(data.ideas);
  writeLocalJournal(data.journal ?? []);
  writeLocalTombstones(data.tombstones ?? []);
  writeSyncMeta({ updatedAt: data.updatedAt });
}

export async function hydrateFromCloud(): Promise<RodSyncData> {
  const local = buildLocalSnapshot();
  const cloud = await fetchCloudSync();

  if (!cloud) {
    if (hasUserContent(local)) {
      await pushCloudSyncMerged(local);
      return buildLocalSnapshot();
    }
    return local;
  }

  const merged = mergeSyncData(local, cloud);
  applyCloudData(merged);
  await pushCloudSyncMerged(buildLocalSnapshot());

  return merged;
}

export async function refreshFromCloud(): Promise<RodSyncData | null> {
  const local = buildLocalSnapshot();
  const cloud = await fetchCloudSync();
  if (!cloud) return null;

  return mergeSyncData(local, cloud);
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleCloudPush(getData: () => RodSyncData) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    const snapshot = getData();
    void pushCloudSyncMerged({
      todos: snapshot.todos,
      ideas: snapshot.ideas,
      journal: snapshot.journal ?? [],
      tombstones: snapshot.tombstones ?? readLocalTombstones(),
      updatedAt: readSyncMeta().updatedAt,
    });
  }, 700);
}

export function flushPendingCloudPush() {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  const snapshot = buildLocalSnapshot();
  void pushCloudSyncMerged({
    ...snapshot,
    updatedAt: Date.now(),
  });
}
