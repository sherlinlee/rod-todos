import type { Idea } from "@/lib/ideas";
import type { JournalEntry } from "@/lib/journal";
import type { Todo } from "@/lib/types";

export type SyncTombstone = {
  key: string;
  deletedAt: number;
};

export type RodSyncData = {
  todos: Todo[];
  ideas: Idea[];
  journal: JournalEntry[];
  tombstones?: SyncTombstone[];
  updatedAt: number;
};

/** @deprecated alias kept for shared sync modules */
export type BelleSyncData = RodSyncData;

export const SYNC_META_KEY = "rod-sync-meta";

export type SyncMeta = {
  updatedAt: number;
};
