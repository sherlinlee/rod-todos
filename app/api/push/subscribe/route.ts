import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRequestAuthenticated } from "@/lib/server/request-auth";
import { getVapidPublicKey, getVapidConfigError, isPushConfigured } from "@/lib/server/push-config";
import { upsertPushSubscription } from "@/lib/server/push-store";
import { parseReminderPreferences } from "@/lib/reminder-prefs";
import type { PushSubscriptionPayload } from "@/lib/push-types";

function parseSubscription(body: unknown): PushSubscriptionPayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Partial<PushSubscriptionPayload> & {
    reminder?: unknown;
  };
  if (
    typeof raw.endpoint !== "string" ||
    !raw.keys ||
    typeof raw.keys.p256dh !== "string" ||
    typeof raw.keys.auth !== "string"
  ) {
    return null;
  }

  const reminder = raw.reminder
    ? parseReminderPreferences(raw.reminder)
    : undefined;

  return {
    endpoint: raw.endpoint,
    keys: {
      p256dh: raw.keys.p256dh,
      auth: raw.keys.auth,
    },
    expirationTime: raw.expirationTime ?? null,
    reminder: reminder ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    configured: isPushConfigured(),
    publicKey: isPushConfigured() ? getVapidPublicKey() : "",
    configError: getVapidConfigError(),
  });
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const subscription = parseSubscription(body);
  if (!subscription) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const saved = await upsertPushSubscription(
    subscription,
    request.headers.get("user-agent") ?? undefined,
  );

  if (!saved) {
    return NextResponse.json(
      { ok: false, error: "storage_unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
