export const AUTH_COOKIE_NAME = "rod-session";
/** @deprecated old Belle port name — middleware still accepts for one release */
export const LEGACY_AUTH_COOKIE_NAME = "belle-session";
export const TRUSTED_DEVICE_COOKIE_NAME = "rod-trusted";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function getAuthToken() {
  return process.env.AUTH_TOKEN;
}

export function getTrustedDeviceToken() {
  return process.env.TRUSTED_DEVICE_TOKEN ?? getAuthToken();
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

export function isTrustedDevice(cookieValue: string | undefined) {
  const token = getTrustedDeviceToken();
  return Boolean(token && cookieValue === token);
}

export function isRequestAuthed(
  sessionToken: string | undefined,
  trustedToken: string | undefined,
) {
  return isAuthenticated(sessionToken) || isTrustedDevice(trustedToken);
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return { ...authCookieOptions, maxAge };
}
