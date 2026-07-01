import type { Idea } from "@/lib/ideas";
import type { JournalEntry } from "@/lib/journal";
import type { Todo } from "@/lib/types";

export type RodSyncData = {
  todos: Todo[];
  ideas: Idea[];
  journal: JournalEntry[];
  updatedAt: number;
};

/** @deprecated alias kept for shared sync modules */
export type BelleSyncData = RodSyncData;

export const SYNC_META_KEY = "rod-sync-meta";

export type SyncMeta = {
  updatedAt: number;
};
