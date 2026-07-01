import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendDueDateReminders } from "@/lib/server/due-reminders";
import { isPushConfigured } from "@/lib/server/push-send";

function isAuthorizedCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
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

  const result = await sendDueDateReminders();
  return NextResponse.json(result);
}
