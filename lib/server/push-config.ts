import webpush from "web-push";
import {
  isValidVapidPublicKey,
  isValidVapidSubject,
  normalizeVapidKey,
} from "@/lib/vapid-utils";

let configured = false;

function readPublicKey() {
  return normalizeVapidKey(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
      process.env.VAPID_PUBLIC_KEY ??
      "",
  );
}

function readPrivateKey() {
  return normalizeVapidKey(process.env.VAPID_PRIVATE_KEY ?? "");
}

function readSubject() {
  return normalizeVapidKey(process.env.VAPID_SUBJECT ?? "");
}

export function getVapidPublicKey() {
  return readPublicKey();
}

export function getVapidConfigError(): string | null {
  const publicKey = readPublicKey();
  const privateKey = readPrivateKey();
  const subject = readSubject();

  if (!publicKey || !privateKey || !subject) {
    return "missing_env";
  }
  if (!isValidVapidPublicKey(publicKey)) {
    return "invalid_public_key";
  }
  if (!isValidVapidSubject(subject)) {
    return "invalid_subject";
  }
  return null;
}

export function isPushConfigured() {
  return getVapidConfigError() === null;
}

export function ensureWebPushConfigured() {
  if (configured) return true;
  if (!isPushConfigured()) return false;

  webpush.setVapidDetails(
    readSubject(),
    readPublicKey(),
    readPrivateKey(),
  );
  configured = true;
  return true;
}
