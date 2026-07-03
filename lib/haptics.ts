export function hapticComplete() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(14);
  }
}

export function hapticSelection() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(6);
  }
}
