export const AUTH_COOKIE_NAME = "rod-session";

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
