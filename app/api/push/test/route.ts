import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSiteConfig } from "@/lib/site";
import { isRequestAuthenticated } from "@/lib/server/request-auth";
import { isPushConfigured } from "@/lib/server/push-config";
import { sendPushToAll } from "@/lib/server/push-send";

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

  const site = getSiteConfig();
  const result = await sendPushToAll({
    title: `${site.appName} — test ping`,
    body: "Push notifications are working ✓",
    url: "/",
    tag: "push-test",
  });

  if (result.total === 0) {
    return NextResponse.json(
      { ok: false, error: "no_subscriptions" },
      { status: 404 },
    );
  }

  if (result.sent === 0) {
    return NextResponse.json(
      { ok: false, error: "delivery_failed", ...result },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
