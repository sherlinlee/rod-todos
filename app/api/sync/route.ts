import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRequestAuthenticated } from "@/lib/server/request-auth";
import {
  isSyncStorageConfigured,
  loadSyncData,
  saveSyncData,
} from "@/lib/server/store";
import { mergeSyncData } from "@/lib/sync-merge";
import { ensureEssentials } from "@/lib/essentials";
import { migrateTodos } from "@/lib/migrate";
import type { RodSyncData, SyncTombstone } from "@/lib/sync-types";
import type { Idea } from "@/lib/ideas";
import { normalizeJournalEntries, type JournalEntry } from "@/lib/journal";
import type { Todo } from "@/lib/types";

function isValidTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") return false;
  const todo = value as Todo;
  return (
    typeof todo.id === "string" &&
    typeof todo.text === "string" &&
    typeof todo.completed === "boolean"
  );
}

function isValidIdea(value: unknown): value is Idea {
  if (!value || typeof value !== "object") return false;
  const idea = value as Idea;
  return typeof idea.id === "string" && typeof idea.text === "string";
}

function isValidJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<JournalEntry>;
  return typeof entry.date === "string" && typeof entry.text === "string";
}

function isValidTombstone(value: unknown): value is SyncTombstone {
  if (!value || typeof value !== "object") return false;
  const tombstone = value as SyncTombstone;
  return (
    typeof tombstone.key === "string" &&
    typeof tombstone.deletedAt === "number"
  );
}

function parseBody(body: unknown): RodSyncData | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Partial<RodSyncData>;
  if (!Array.isArray(raw.todos) || !Array.isArray(raw.ideas)) return null;
  if (typeof raw.updatedAt !== "number") return null;

  const todos = ensureEssentials(migrateTodos(raw.todos.filter(isValidTodo)));
  const ideas = raw.ideas.filter(isValidIdea);
  const journal = Array.isArray(raw.journal)
    ? normalizeJournalEntries(raw.journal.filter(isValidJournalEntry))
    : [];
  const tombstones = Array.isArray(raw.tombstones)
    ? raw.tombstones.filter(isValidTombstone)
    : [];

  return {
    todos,
    ideas,
    journal,
    tombstones,
    updatedAt: raw.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const data = await loadSyncData();
  if (!data) {
    return NextResponse.json({ ok: true, data: null });
  }

  return NextResponse.json({ ok: true, data });
}

export async function PUT(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isSyncStorageConfigured()) {
    return NextResponse.json(
      { ok: false, error: "storage_not_configured" },
      { status: 503 },
    );
  }

  const existing = await loadSyncData();
  const merged = existing ? mergeSyncData(parsed, existing) : parsed;

  const payload = { ...merged, updatedAt: Date.now() };

  const saved = await saveSyncData(payload);
  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "storage_unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, data: payload });
}
