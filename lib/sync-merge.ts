import type { Idea } from "@/lib/ideas";
import { ensureEssentials } from "@/lib/essentials";
import type { JournalEntry } from "@/lib/journal";
import { migrateTodos } from "@/lib/migrate";
import type { RodSyncData } from "@/lib/sync-types";
import type { Todo } from "@/lib/types";

function mergeById<T extends { id: string }>(
  local: T[],
  cloud: T[],
  cloudIsNewer: boolean,
): T[] {
  const map = new Map<string, T>();

  for (const item of local) {
    map.set(item.id, item);
  }

  for (const item of cloud) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
      continue;
    }
    if (cloudIsNewer) {
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

  for (const entry of local) {
    map.set(entry.date, entry);
  }

  for (const entry of cloud) {
    const existing = map.get(entry.date);
    if (!existing || entry.updatedAt > existing.updatedAt) {
      map.set(entry.date, entry);
    }
  }

  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function mergeSyncData(
  local: RodSyncData,
  cloud: RodSyncData,
): RodSyncData {
  const cloudIsNewer = cloud.updatedAt >= local.updatedAt;

  const todos = ensureEssentials(
    migrateTodos(mergeById(local.todos, cloud.todos, cloudIsNewer)),
  );

  const ideas = mergeById(local.ideas, cloud.ideas, cloudIsNewer).sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  const journal = mergeJournal(
    local.journal ?? [],
    cloud.journal ?? [],
  );

  return {
    todos,
    ideas,
    journal,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt, Date.now()),
  };
}

export function hasUserContent(data: RodSyncData) {
  const hasIdeas = data.ideas.length > 0;
  const hasTodos = data.todos.some((todo) => !todo.permanent);
  const hasJournal = (data.journal ?? []).some((entry) => entry.text.trim());
  return hasIdeas || hasTodos || hasJournal;
}
