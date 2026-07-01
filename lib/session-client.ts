export const PIN_VERIFIED_KEY = "belle-pin-verified";
export const SKIP_REAUTH_CLEAR_KEY = "belle-skip-reauth-clear";

export function markPinVerified() {
  sessionStorage.setItem(PIN_VERIFIED_KEY, "1");
  sessionStorage.setItem(SKIP_REAUTH_CLEAR_KEY, "1");
}

export function isPinVerified() {
  return sessionStorage.getItem(PIN_VERIFIED_KEY) === "1";
}

export function clearPinVerified() {
  sessionStorage.removeItem(PIN_VERIFIED_KEY);
  sessionStorage.removeItem(SKIP_REAUTH_CLEAR_KEY);
}

/** Clear unlock state on refresh, close, or background — unless just logged in. */
export function handlePageHideForReauth() {
  if (sessionStorage.getItem(SKIP_REAUTH_CLEAR_KEY) === "1") {
    sessionStorage.removeItem(SKIP_REAUTH_CLEAR_KEY);
    return;
  }
  clearPinVerified();
}
