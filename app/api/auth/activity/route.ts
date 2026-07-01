import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_ACTIVITY_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  authCookieOptions,
  isAuthenticated,
  isSessionActive,
} from "@/lib/auth";

function clearSessionCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  cookieStore.set(AUTH_COOKIE_NAME, "", { ...authCookieOptions, maxAge: 0 });
  cookieStore.set(AUTH_ACTIVITY_COOKIE_NAME, "", {
    ...authCookieOptions,
    maxAge: 0,
  });
}

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const activity = cookieStore.get(AUTH_ACTIVITY_COOKIE_NAME)?.value;

  if (!isAuthenticated(session)) {
    clearSessionCookies(cookieStore);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (activity && !isSessionActive(activity)) {
    clearSessionCookies(cookieStore);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  cookieStore.set(AUTH_ACTIVITY_COOKIE_NAME, String(Date.now()), {
    ...authCookieOptions,
    maxAge: 60 * 60 * 24,
  });

  return NextResponse.json({ ok: true });
}
