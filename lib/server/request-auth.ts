import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isAuthenticated } from "@/lib/auth";

export function isRequestAuthenticated(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return isAuthenticated(cookie);
}
