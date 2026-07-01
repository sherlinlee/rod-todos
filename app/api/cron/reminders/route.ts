import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPushConfigured } from "@/lib/server/push-config";
import {
  buildDailyReminderMessage,
  shouldSendScheduledReminders,
} from "@/lib/server/reminders";
import { sendPushToAll } from "@/lib/server/push-send";

function isAuthorizedCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { ok: false, error: "push_not_configured" },
      { status: 503 },
    );
  }

  const force = request.nextUrl.searchParams.get("force") === "1";
  if (!force && !shouldSendScheduledReminders()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "outside_window" });
  }

  const message = await buildDailyReminderMessage();
  if (!message) {
    return NextResponse.json({ ok: true, skipped: true, reason: "nothing_due" });
  }

  const result = await sendPushToAll(message);
  return NextResponse.json({ ok: true, ...result, message });
}
