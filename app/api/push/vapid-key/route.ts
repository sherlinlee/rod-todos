import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "@/lib/server/push-send";

export async function GET() {
  if (!isPushConfigured()) {
    return NextResponse.json({ ok: false, error: "push_not_configured" });
  }

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ ok: false, error: "push_not_configured" });
  }

  return NextResponse.json({ ok: true, publicKey });
}
