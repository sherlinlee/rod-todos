import type { Idea } from "@/lib/ideas";
import { ensureEssentials } from "@/lib/essentials";
import { normalizeJournalEntries, type JournalEntry } from "@/lib/journal";
import { migrateTodos } from "@/lib/migrate";
import type { RodSyncData, SyncTombstone } from "@/lib/sync-types";
import type { Todo } from "@/lib/types";

const JOURNAL_ENTRY_TOMBSTONE_PREFIX = "journal-entry:";
const JOURNAL_DATE_TOMBSTONE_PREFIX = "journal:";

function todoUpdatedAt(todo: Todo): number {
  return todo.updatedAt ?? todo.createdAt;
}

function tombstoneMap(tombstones: SyncTombstone[] = []): Map<string, number> {
  const map = new Map<string, number>();
  for (const tombstone of tombstones) {
    map.set(
      tombstone.key,
      Math.max(map.get(tombstone.key) ?? 0, tombstone.deletedAt),
    );
  }
  return map;
}

function mergeTombstones(
  local: SyncTombstone[] = [],
  cloud: SyncTombstone[] = [],
): SyncTombstone[] {
  return [...tombstoneMap([...local, ...cloud]).entries()].map(
    ([key, deletedAt]) => ({ key, deletedAt }),
  );
}

function isRemoved(
  key: string,
  updatedAt: number,
  tombstones: Map<string, number>,
): boolean {
  const deletedAt = tombstones.get(key);
  return deletedAt !== undefined && deletedAt >= updatedAt;
}

function ideaUpdatedAt(idea: Idea): number {
  return idea.updatedAt ?? idea.createdAt;
}

function filterTombstonedTodos(
  todos: Todo[],
  tombstones: Map<string, number>,
): Todo[] {
  return todos.filter(
    (todo) =>
      !isRemoved(`todo:${todo.id}`, todoUpdatedAt(todo), tombstones),
  );
}

function isLegacyJournalEntry(entry: JournalEntry): boolean {
  return (
    entry.id === `legacy-${entry.date}` ||
    entry.id.startsWith(`legacy-${entry.date}-`)
  );
}

function isJournalEntryRemoved(
  entry: JournalEntry,
  tombstones: Map<string, number>,
): boolean {
  const entryKey = `${JOURNAL_ENTRY_TOMBSTONE_PREFIX}${entry.id}`;
  if (isRemoved(entryKey, entry.updatedAt, tombstones)) return true;

  if (!isLegacyJournalEntry(entry)) return false;

  const legacyDateKey = `${JOURNAL_DATE_TOMBSTONE_PREFIX}${entry.date}`;
  return isRemoved(legacyDateKey, entry.updatedAt, tombstones);
}

function mergeById<T extends { id: string }>(
  local: T[],
  cloud: T[],
  getUpdatedAt: (item: T) => number,
  localRevision: number,
  tombstoneKey: (item: T) => string,
  tombstones: Map<string, number>,
): T[] {
  const map = new Map<string, T>();

  for (const item of local) {
    const key = tombstoneKey(item);
    if (isRemoved(key, getUpdatedAt(item), tombstones)) continue;
    map.set(item.id, item);
  }

  for (const item of cloud) {
    const key = tombstoneKey(item);
    if (isRemoved(key, getUpdatedAt(item), tombstones)) continue;

    const existing = map.get(item.id);
    if (!existing) {
      if (localRevision > getUpdatedAt(item)) {
        continue;
      }
      map.set(item.id, item);
      continue;
    }
    if (getUpdatedAt(item) > getUpdatedAt(existing)) {
      map.set(item.id, item);
    }
  }

  return [...map.values()];
}

function mergeJournal(
  local: JournalEntry[],
  cloud: JournalEntry[],
  tombstones: Map<string, number>,
  localRevision: number,
): JournalEntry[] {
  const localNormalized = normalizeJournalEntries(local);
  const cloudNormalized = normalizeJournalEntries(cloud);
  const localIds = new Set(localNormalized.map((entry) => entry.id));
  const map = new Map<string, JournalEntry>();

  for (const entry of localNormalized) {
    if (isJournalEntryRemoved(entry, tombstones)) {
      continue;
    }
    map.set(entry.id, entry);
  }

  for (const entry of cloudNormalized) {
    if (isJournalEntryRemoved(entry, tombstones)) {
      continue;
    }

    const existing = map.get(entry.id);
    if (existing) {
      if (entry.updatedAt > existing.updatedAt) {
        map.set(entry.id, entry);
      }
      continue;
    }

    // Local sync is newer and omits this entry — don't resurrect deletes from cloud.
    if (!localIds.has(entry.id) && localRevision > entry.updatedAt) {
      continue;
    }

    map.set(entry.id, entry);
  }

  return [...map.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

function syncPayloadKey(data: RodSyncData): string {
  const todos = [...data.todos].sort((a, b) => a.id.localeCompare(b.id));
  const ideas = [...data.ideas].sort((a, b) => a.id.localeCompare(b.id));
  const journal = [...(data.journal ?? [])].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const tombstones = [...(data.tombstones ?? [])].sort((a, b) =>
    a.key.localeCompare(b.key),
  );
  return JSON.stringify({ todos, ideas, journal, tombstones });
}

export function hasUserTodos(data: RodSyncData) {
  return data.todos.some((todo) => !todo.permanent);
}

function contentRevision(
  timestamps: number[],
): number {
  if (timestamps.length === 0) return 0;
  return Math.max(...timestamps);
}

function userTodoTimestamps(todos: Todo[]): number[] {
  return todos
    .filter((todo) => !todo.permanent)
    .map(todoUpdatedAt);
}

export function mergeSyncData(
  local: RodSyncData,
  cloud: RodSyncData,
): RodSyncData {
  const tombstones = mergeTombstones(local.tombstones, cloud.tombstones);
  const tombstoneLookup = tombstoneMap(tombstones);

  const todoLocalRevision = contentRevision(userTodoTimestamps(local.todos));
  const ideaLocalRevision = contentRevision(
    local.ideas.map(ideaUpdatedAt),
  );

  let todos = ensureEssentials(
    migrateTodos(
      mergeById(
        local.todos,
        cloud.todos,
        todoUpdatedAt,
        todoLocalRevision,
        (todo) => `todo:${todo.id}`,
        tombstoneLookup,
      ),
    ),
  );

  const localUserTodoCount = userTodoTimestamps(local.todos).length;
  const cloudUserTodoCount = userTodoTimestamps(cloud.todos).length;
  const mergedUserTodoCount = userTodoTimestamps(todos).length;

  const recoverableCloudTodos = filterTombstonedTodos(
    cloud.todos,
    tombstoneLookup,
  );
  const hasRecoverableCloudTodos = hasUserTodos({
    ...cloud,
    todos: recoverableCloudTodos,
  });

  if (
    hasRecoverableCloudTodos &&
    ((!hasUserTodos({ ...local, todos: local.todos }) && hasUserTodos(cloud)) ||
      (cloudUserTodoCount > mergedUserTodoCount &&
        cloudUserTodoCount >= localUserTodoCount))
  ) {
    todos = ensureEssentials(migrateTodos(recoverableCloudTodos));
  }

  const ideas = mergeById(
    local.ideas,
    cloud.ideas,
    ideaUpdatedAt,
    ideaLocalRevision,
    (idea) => `idea:${idea.id}`,
    tombstoneLookup,
  ).sort((a, b) => ideaUpdatedAt(b) - ideaUpdatedAt(a));

  const journalLocalRevision = local.updatedAt;

  const journal = mergeJournal(
    local.journal ?? [],
    cloud.journal ?? [],
    tombstoneLookup,
    journalLocalRevision,
  );

  return {
    todos,
    ideas,
    journal,
    tombstones,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  };
}

export function needsCloudPush(merged: RodSyncData, cloud: RodSyncData) {
  return syncPayloadKey(merged) !== syncPayloadKey(cloud);
}

export function hasUserContent(data: RodSyncData) {
  const hasIdeas = data.ideas.length > 0;
  const hasTodos = hasUserTodos(data);
  const hasJournal = (data.journal ?? []).some((entry) => entry.text.trim());
  return hasIdeas || hasTodos || hasJournal;
}

/** @deprecated used by belle-ported components */
export function journalRevision(journal: JournalEntry[]): string {
  return normalizeJournalEntries(journal)
    .map((entry) => `${entry.id}:${entry.updatedAt}`)
    .sort()
    .join("|");
}
