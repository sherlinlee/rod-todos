import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  getAuthToken,
  getTrustedDeviceToken,
  isValidPin,
  sessionCookieOptions,
  TRUSTED_DEVICE_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  let pin = "";

  try {
    const body = await request.json();
    pin = typeof body.pin === "string" ? body.pin : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isValidPin(pin)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = getAuthToken();
  const trustedToken = getTrustedDeviceToken();
  if (!token || !trustedToken) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const cookieStore = await cookies();
  const opts = sessionCookieOptions();
  cookieStore.set(AUTH_COOKIE_NAME, token, opts);
  cookieStore.set(TRUSTED_DEVICE_COOKIE_NAME, trustedToken, opts);

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const cleared = { ...authCookieOptions, maxAge: 0 };
  cookieStore.set(AUTH_COOKIE_NAME, "", cleared);
  cookieStore.set(TRUSTED_DEVICE_COOKIE_NAME, "", cleared);
  return NextResponse.json({ ok: true });
}
