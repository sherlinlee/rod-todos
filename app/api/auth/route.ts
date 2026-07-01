import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_ACTIVITY_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  authCookieOptions,
  getAuthToken,
  isValidPin,
} from "@/lib/auth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

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
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const cookieStore = await cookies();
  const now = String(Date.now());
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
  cookieStore.set(AUTH_ACTIVITY_COOKIE_NAME, now, {
    ...authCookieOptions,
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", { ...authCookieOptions, maxAge: 0 });
  cookieStore.set(AUTH_ACTIVITY_COOKIE_NAME, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
