import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRequestAuthenticated } from "@/lib/server/request-auth";
import {
  getPushSubscription,
  updatePushSubscriptionReminder,
} from "@/lib/server/push-store";
import {
  getDefaultReminderPreferences,
  normalizeReminderPreferences,
  parseReminderPreferences,
} from "@/lib/reminder-prefs";

export async function GET(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const endpoint = request.nextUrl.searchParams.get("endpoint")?.trim();
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "missing_endpoint" }, { status: 400 });
  }

  const subscription = await getPushSubscription(endpoint);
  if (!subscription) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    reminder: normalizeReminderPreferences(subscription.reminder),
  });
}

export async function POST(request: NextRequest) {
  if (!isRequestAuthenticated(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const raw = body as { endpoint?: string; reminder?: unknown };
  const endpoint = raw.endpoint?.trim();
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "missing_endpoint" }, { status: 400 });
  }

  const reminder = parseReminderPreferences(raw.reminder);
  if (!reminder) {
    return NextResponse.json({ ok: false, error: "invalid_reminder" }, { status: 400 });
  }

  const saved = await updatePushSubscriptionReminder(endpoint, reminder);
  if (!saved) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, reminder });
}
