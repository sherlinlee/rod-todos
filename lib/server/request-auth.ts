import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isRequestAuthed,
  TRUSTED_DEVICE_COOKIE_NAME,
} from "@/lib/auth";

export function isRequestAuthenticated(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const trusted = request.cookies.get(TRUSTED_DEVICE_COOKIE_NAME)?.value;
  return isRequestAuthed(session, trusted);
}
