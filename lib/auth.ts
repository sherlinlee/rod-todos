export const AUTH_COOKIE_NAME = "belle-session";
export const AUTH_ACTIVITY_COOKIE_NAME = "belle-session-at";
export const SESSION_INACTIVITY_MS = 10 * 60 * 1000;

export function getAuthToken() {
  return process.env.AUTH_TOKEN;
}

export function getAppPin() {
  return process.env.APP_PIN;
}

export function isValidPin(pin: string) {
  const expected = getAppPin();
  return (
    typeof expected === "string" &&
    expected.length === 6 &&
    /^\d{6}$/.test(pin) &&
    pin === expected
  );
}

export function isAuthenticated(cookieValue: string | undefined) {
  const token = getAuthToken();
  return Boolean(token && cookieValue === token);
}

export function isSessionActive(lastActivityRaw: string | undefined) {
  const lastActivity = Number(lastActivityRaw);
  if (!Number.isFinite(lastActivity) || lastActivity <= 0) return false;
  return Date.now() - lastActivity <= SESSION_INACTIVITY_MS;
}

export function isSessionValid(
  sessionToken: string | undefined,
  lastActivityRaw: string | undefined,
) {
  return isAuthenticated(sessionToken) && isSessionActive(lastActivityRaw);
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
