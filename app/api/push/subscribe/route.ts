import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRequestAuthenticated } from "@/lib/server/request-auth";
import {
  isPushStorageConfigured,
  removePushSubscription,
  upsertPushSubscription,
} from "@/lib/server/push-store";
import { isPushConfigured } from "@/lib/server/push-send";
import type { PushSubscribePayload } from "@/lib/push-types";

function parseSubscription(body: unknown): PushSubscribePayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Partial<PushSubscribePayload>;
  if (typeof raw.endpoint !== "string") return null;
  if (!raw.keys || typeof raw.keys !== "object") return null;
  if (typeof raw.keys.p256dh !== "string" || typeof raw.keys.auth !== "string") {
    return null;
  }
  return {
    endpoint: raw.endpoint,
    keys: {
      p256dh: raw.keys.p256dh,
      auth: raw.keys.auth,
    },
  };
}

export async function POST(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { ok: false, error: "push_not_configured" },
      { status: 503 },
    );
  }

  if (!isPushStorageConfigured()) {
    return NextResponse.json(
      { ok: false, error: "storage_not_configured" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = parseSubscription(body);
  if (!parsed) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const saved = await upsertPushSubscription({
    ...parsed,
    createdAt: Date.now(),
  });

  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "storage_unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const endpoint =
    body && typeof body === "object" && typeof (body as { endpoint?: unknown }).endpoint === "string"
      ? (body as { endpoint: string }).endpoint
      : null;

  if (!endpoint) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const removed = await removePushSubscription(endpoint);
  if (!removed) {
    return NextResponse.json(
      { ok: false, error: "storage_unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
