import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isRequestAuthed,
  LEGACY_AUTH_COOKIE_NAME,
  TRUSTED_DEVICE_COOKIE_NAME,
} from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/icon-512.png"
  ) {
    return NextResponse.next();
  }

  const session =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ??
    request.cookies.get(LEGACY_AUTH_COOKIE_NAME)?.value;
  const trusted = request.cookies.get(TRUSTED_DEVICE_COOKIE_NAME)?.value;
  const authed = isRequestAuthed(session, trusted);

  if (pathname === "/login") {
    if (authed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (authed) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|apple-touch-icon.png|icon-512.png).*)",
  ],
};
