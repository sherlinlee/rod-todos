import type { Idea } from "@/lib/ideas";
import { ensureEssentials } from "@/lib/essentials";
import type { JournalEntry } from "@/lib/journal";
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
  localRevision: number,
  tombstones: Map<string, number>,
): JournalEntry[] {
  const map = new Map<string, JournalEntry>();

  for (const entry of local) {
    const key = `journal:${entry.date}`;
    if (isRemoved(key, entry.updatedAt, tombstones)) continue;
    map.set(entry.date, entry);
  }

  for (const entry of cloud) {
    const key = `journal:${entry.date}`;
    if (isRemoved(key, entry.updatedAt, tombstones)) continue;

    const existing = map.get(entry.date);
    if (!existing) {
      if (localRevision > entry.updatedAt) {
        continue;
      }
      map.set(entry.date, entry);
      continue;
    }
    if (entry.updatedAt > existing.updatedAt) {
      map.set(entry.date, entry);
    }
  }

  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function syncPayloadKey(data: RodSyncData): string {
  const todos = [...data.todos].sort((a, b) => a.id.localeCompare(b.id));
  const ideas = [...data.ideas].sort((a, b) => a.id.localeCompare(b.id));
  const journal = [...(data.journal ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const tombstones = [...(data.tombstones ?? [])].sort((a, b) =>
    a.key.localeCompare(b.key),
  );
  return JSON.stringify({ todos, ideas, journal, tombstones });
}

export function mergeSyncData(
  local: RodSyncData,
  cloud: RodSyncData,
): RodSyncData {
  // Empty local (e.g. stale PWA storage after a bad sync) must not block cloud items
  // whose per-item timestamps are older than a bogus high local revision.
  const localRevision = hasUserContent(local) ? local.updatedAt : 0;
  const tombstones = mergeTombstones(local.tombstones, cloud.tombstones);
  const tombstoneLookup = tombstoneMap(tombstones);

  const todos = ensureEssentials(
    migrateTodos(
      mergeById(
        local.todos,
        cloud.todos,
        todoUpdatedAt,
        localRevision,
        (todo) => `todo:${todo.id}`,
        tombstoneLookup,
      ),
    ),
  );

  const ideas = mergeById(
    local.ideas,
    cloud.ideas,
    (idea) => idea.createdAt,
    localRevision,
    (idea) => `idea:${idea.id}`,
    tombstoneLookup,
  ).sort((a, b) => b.createdAt - a.createdAt);

  const journal = mergeJournal(
    local.journal ?? [],
    cloud.journal ?? [],
    localRevision,
    tombstoneLookup,
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
  const hasTodos = data.todos.some((todo) => !todo.permanent);
  const hasJournal = (data.journal ?? []).some((entry) => entry.text.trim());
  return hasIdeas || hasTodos || hasJournal;
}
