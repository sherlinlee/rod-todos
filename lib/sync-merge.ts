import type { Idea } from "@/lib/ideas";
import { ensureEssentials } from "@/lib/essentials";
import { normalizeJournalEntries, type JournalEntry } from "@/lib/journal";
import { migrateTodos } from "@/lib/migrate";
import type { RodSyncData, SyncTombstone } from "@/lib/sync-types";
import type { Todo } from "@/lib/types";

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
): JournalEntry[] {
  const map = new Map<string, JournalEntry>();

  for (const entry of normalizeJournalEntries([...local, ...cloud])) {
    const existing = map.get(entry.id);
    if (!existing || entry.updatedAt > existing.updatedAt) {
      map.set(entry.id, entry);
    }
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

export function mergeSyncData(
  local: RodSyncData,
  cloud: RodSyncData,
): RodSyncData {
  const tombstones = mergeTombstones(local.tombstones, cloud.tombstones);
  const tombstoneLookup = tombstoneMap(tombstones);

  const todoLocalRevision = hasUserTodos(local) ? local.updatedAt : 0;
  const ideaLocalRevision = local.ideas.length > 0 ? local.updatedAt : 0;
  const journalLocalRevision = (local.journal ?? []).some((entry) =>
    entry.text.trim(),
  )
    ? local.updatedAt
    : 0;

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

  if (!hasUserTodos({ ...local, todos: local.todos }) && hasUserTodos(cloud)) {
    todos = ensureEssentials(migrateTodos(cloud.todos));
  }

  const ideas = mergeById(
    local.ideas,
    cloud.ideas,
    (idea) => idea.createdAt,
    ideaLocalRevision,
    (idea) => `idea:${idea.id}`,
    tombstoneLookup,
  ).sort((a, b) => b.createdAt - a.createdAt);

  const journal = mergeJournal(local.journal ?? [], cloud.journal ?? []);

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
