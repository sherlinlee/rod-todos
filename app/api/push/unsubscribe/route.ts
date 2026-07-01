import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRequestAuthenticated } from "@/lib/server/request-auth";
import { removePushSubscription } from "@/lib/server/push-store";

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

  const endpoint =
    body &&
    typeof body === "object" &&
    "endpoint" in body &&
    typeof (body as { endpoint?: unknown }).endpoint === "string"
      ? (body as { endpoint: string }).endpoint
      : "";

  if (!endpoint) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await removePushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
