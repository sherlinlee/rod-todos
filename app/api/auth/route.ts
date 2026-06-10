import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getAuthToken, isValidPin } from "@/lib/auth";

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
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
