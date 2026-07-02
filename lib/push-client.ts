import type { PushSubscriptionPayload } from "@/lib/push-types";
import {
  getBrowserDefaultReminderPreferences,
  type ReminderPreferences,
} from "@/lib/reminder-prefs";
import { getSiteConfig } from "@/lib/site";
import { decodeVapidPublicKey, isValidVapidPublicKey } from "@/lib/vapid-utils";

const SW_URL = "/sw.js";

function pushEndpointStorageKey() {
  return `${getSiteConfig().owner}-push-endpoint`;
}

function productionUrl() {
  return "rod-todos.vercel.app";
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    window.isSecureContext
  );
}

export function getPushSecureContextError() {
  if (typeof window === "undefined") return null;
  if (window.isSecureContext) return null;
  return `Push needs HTTPS — open ${productionUrl()} or use localhost, not a local IP address.`;
}

export function getPushSupportHint() {
  if (typeof window === "undefined") return null;

  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone);

  if (isIos && !standalone) {
    return "On iPhone: Share → Add to Home Screen, open the app from your home screen, then turn on reminders.";
  }

  if (!("serviceWorker" in navigator)) {
    return "This browser does not support service workers.";
  }

  if (!("PushManager" in window)) {
    return "Push is not available in this browser tab. Try Chrome, or install the app to your home screen.";
  }

  return "Push notifications are not available in this browser.";
}

async function fetchPushConfig() {
  const res = await fetch("/api/push/subscribe", { cache: "no-store" });
  if (res.status === 401) {
    window.location.href = "/login";
    return null;
  }
  if (!res.ok) return null;
  const json = (await res.json()) as {
    ok: boolean;
    configured?: boolean;
    publicKey?: string;
    configError?: string | null;
  };
  if (!json.ok || !json.configured || !json.publicKey) {
    if (json.configError) {
      throw new Error(json.configError);
    }
    return null;
  }
  return json.publicKey;
}

async function getServiceWorkerRegistration() {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  return navigator.serviceWorker.register(SW_URL, { scope: "/" });
}

function subscriptionPayload(
  subscription: PushSubscription,
): PushSubscriptionPayload {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("invalid_subscription");
  }

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    expirationTime: json.expirationTime ?? null,
  };
}

export async function getStoredPushEndpoint() {
  try {
    return localStorage.getItem(pushEndpointStorageKey());
  } catch {
    return null;
  }
}

function storePushEndpoint(endpoint: string | null) {
  try {
    if (!endpoint) localStorage.removeItem(pushEndpointStorageKey());
    else localStorage.setItem(pushEndpointStorageKey(), endpoint);
  } catch {
    /* ignore */
  }
}

export async function getCurrentPushSubscription() {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

async function createPushSubscription(publicKey: string) {
  const registration = await getServiceWorkerRegistration();
  await navigator.serviceWorker.ready;

  if (!isValidVapidPublicKey(publicKey)) {
    throw new Error("invalid_public_key");
  }

  const applicationServerKey = Uint8Array.from(decodeVapidPublicKey(publicKey));
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await existing.unsubscribe().catch(() => undefined);
  }

  try {
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "SecurityError" || name === "InvalidStateError") {
      const stale = await registration.pushManager.getSubscription();
      if (stale) {
        await stale.unsubscribe().catch(() => undefined);
      }
      try {
        return await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      } catch (retryError) {
        if (retryError instanceof DOMException && retryError.name === "SecurityError") {
          throw new Error("security_error");
        }
        throw retryError;
      }
    }
    throw error;
  }
}

export async function subscribeToPush(reminder?: ReminderPreferences) {
  const secureContextError = getPushSecureContextError();
  if (secureContextError) {
    throw new Error("insecure_context");
  }

  if (!isPushSupported()) {
    throw new Error("unsupported");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(permission === "denied" ? "denied" : "dismissed");
  }

  const publicKey = await fetchPushConfig();
  if (!publicKey) {
    throw new Error("not_configured");
  }

  const subscription = await createPushSubscription(publicKey);
  const payload = subscriptionPayload(subscription);
  const reminderPrefs = reminder ?? getBrowserDefaultReminderPreferences();
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, reminder: reminderPrefs }),
  });

  if (!res.ok) {
    throw new Error("subscribe_failed");
  }

  storePushEndpoint(payload.endpoint);
  return payload.endpoint;
}

export async function unsubscribeFromPush() {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) {
    storePushEndpoint(null);
    return;
  }

  const endpoint = subscription.endpoint;
  await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });

  await subscription.unsubscribe();
  storePushEndpoint(null);
}

export async function sendTestPush(): Promise<{
  sent: number;
  total: number;
  shownLocally: boolean;
}> {
  const res = await fetch("/api/push/test", {
    method: "POST",
    credentials: "include",
  });
  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; error?: string; sent?: number; total?: number }
    | null;
  if (!res.ok) {
    throw new Error(json?.error ?? "test_failed");
  }
  const sent = json?.sent ?? 0;
  const total = json?.total ?? 0;
  if (!json?.ok || sent === 0) {
    throw new Error(json?.error ?? "delivery_failed");
  }

  let shownLocally = false;
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("rod's to-do(s) ⚡ — test ping", {
      body: "Push notifications are working ✓",
      icon: "/icon-512.png",
      badge: "/icon-512.png",
      tag: "push-test-local",
    });
    shownLocally = true;
  } catch {
    if (Notification.permission === "granted") {
      new Notification("rod's to-do(s) ⚡ — test ping", {
        body: "Push notifications are working ✓",
        icon: "/icon-512.png",
      });
      shownLocally = true;
    }
  }

  return { sent, total, shownLocally };
}

export function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export async function fetchReminderPreferences(endpoint: string) {
  const res = await fetch(
    `/api/push/reminder?endpoint=${encodeURIComponent(endpoint)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    ok?: boolean;
    reminder?: ReminderPreferences;
  };
  if (!json.ok || !json.reminder) return null;
  return json.reminder;
}

export async function saveReminderPreferences(
  endpoint: string,
  reminder: ReminderPreferences,
) {
  const res = await fetch("/api/push/reminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, reminder }),
  });
  if (!res.ok) {
    throw new Error("save_failed");
  }
  const json = (await res.json()) as { ok?: boolean; reminder?: ReminderPreferences };
  if (!json.ok || !json.reminder) {
    throw new Error("save_failed");
  }
  return json.reminder;
}

export async function syncPushSubscriptionState() {
  if (!isPushSupported()) return "unsupported" as const;
  if (Notification.permission !== "granted") {
    return Notification.permission === "denied"
      ? ("denied" as const)
      : ("default" as const);
  }

  const subscription = await getCurrentPushSubscription();
  if (!subscription) return "default" as const;

  const endpoint = subscription.endpoint;
  const stored = await getStoredPushEndpoint();
  if (stored !== endpoint) {
    try {
      await subscribeToPush();
    } catch {
      return "default" as const;
    }
  }

  return "enabled" as const;
}

export function describePushError(code: string) {
  switch (code) {
    case "denied":
      return "Notifications are blocked in browser settings";
    case "not_configured":
      return "Push is not configured on the server yet";
    case "missing_env":
      return "VAPID env vars are missing on the server";
    case "invalid_public_key":
      return "VAPID public key is invalid — run npm run vapid and update env vars";
    case "invalid_subject":
      return "VAPID_SUBJECT must start with mailto: or https://";
    case "insecure_context":
      return getPushSecureContextError() ?? "Push requires a secure connection";
    case "security_error":
      return "Browser rejected the VAPID key — regenerate keys, update Vercel env, redeploy, then try again";
    case "subscribe_failed":
      return "Could not save your subscription on the server";
    case "delivery_failed":
      return "Could not deliver the test ping — turn reminders off, then on again";
    default:
      return "Could not enable notifications";
  }
}
