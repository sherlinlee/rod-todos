import type { Idea } from "@/lib/ideas";
import { ensureEssentials } from "@/lib/essentials";
import { normalizeJournalEntries, type JournalEntry } from "@/lib/journal";
import { migrateTodos } from "@/lib/migrate";
import type { BelleSyncData } from "@/lib/sync-types";
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

  for (const entry of normalizeJournalEntries([...local, ...cloud])) {
    const existing = map.get(entry.id);
    if (!existing || entry.updatedAt > existing.updatedAt) {
      map.set(entry.id, entry);
    }
  }

  return [...map.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function mergeSyncData(
  local: BelleSyncData,
  cloud: BelleSyncData,
): BelleSyncData {
  if (local.updatedAt >= cloud.updatedAt) {
    return {
      todos: ensureEssentials(migrateTodos(local.todos)),
      ideas: local.ideas,
      journal: mergeJournal(local.journal ?? [], cloud.journal ?? []),
      updatedAt: Math.max(local.updatedAt, Date.now()),
    };
  }

  const cloudIsNewer = true;

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

export function journalRevision(journal: JournalEntry[]): string {
  return normalizeJournalEntries(journal)
    .map((entry) => `${entry.id}:${entry.updatedAt}`)
    .sort()
    .join("|");
}

export function hasUserContent(data: BelleSyncData) {
  const hasIdeas = data.ideas.length > 0;
  const hasTodos = data.todos.some((todo) => !todo.permanent);
  const hasJournal = (data.journal ?? []).some((entry) => entry.text.trim());
  return hasIdeas || hasTodos || hasJournal;
}
