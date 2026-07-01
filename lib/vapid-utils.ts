export function normalizeVapidKey(key: string) {
  return key.trim().replace(/^["']|["']$/g, "");
}

export function decodeVapidPublicKey(base64String: string): Uint8Array {
  const normalized = normalizeVapidKey(base64String);
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const base64 = (normalized + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isValidVapidPublicKey(key: string) {
  try {
    const bytes = decodeVapidPublicKey(key);
    return bytes.length === 65 && bytes[0] === 0x04;
  } catch {
    return false;
  }
}

export function isValidVapidSubject(subject: string) {
  const value = normalizeVapidKey(subject);
  return value.startsWith("mailto:") || value.startsWith("https://");
}
