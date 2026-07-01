import { get, put } from "@vercel/blob";
import { getSiteConfig } from "@/lib/site";
import type {
  PushStoreData,
  PushSubscriptionPayload,
  StoredPushSubscription,
} from "@/lib/push-types";

function blobPathname() {
  return getSiteConfig().pushBlobName;
}

function emptyStore(): PushStoreData {
  return { subscriptions: [] };
}

export async function loadPushStore(): Promise<PushStoreData> {
  try {
    const result = await get(blobPathname(), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return emptyStore();
    }

    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as PushStoreData;
    if (!Array.isArray(parsed.subscriptions)) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

async function savePushStore(data: PushStoreData): Promise<boolean> {
  try {
    await put(blobPathname(), JSON.stringify(data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return true;
  } catch {
    return false;
  }
}

function isValidSubscription(
  value: unknown,
): value is PushSubscriptionPayload {
  if (!value || typeof value !== "object") return false;
  const sub = value as Partial<PushSubscriptionPayload>;
  return (
    typeof sub.endpoint === "string" &&
    sub.endpoint.length > 0 &&
    !!sub.keys &&
    typeof sub.keys.p256dh === "string" &&
    typeof sub.keys.auth === "string"
  );
}

export async function upsertPushSubscription(
  subscription: PushSubscriptionPayload,
  userAgent?: string,
): Promise<boolean> {
  if (!isValidSubscription(subscription)) return false;

  const store = await loadPushStore();
  const next: StoredPushSubscription = {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    expirationTime: subscription.expirationTime ?? null,
    createdAt: Date.now(),
    userAgent,
  };

  const without = store.subscriptions.filter(
    (item) => item.endpoint !== subscription.endpoint,
  );
  without.push(next);

  return savePushStore({ subscriptions: without });
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  if (!endpoint) return false;
  const store = await loadPushStore();
  const next = store.subscriptions.filter((item) => item.endpoint !== endpoint);
  if (next.length === store.subscriptions.length) return true;
  return savePushStore({ subscriptions: next });
}

export async function listPushSubscriptions(): Promise<StoredPushSubscription[]> {
  const store = await loadPushStore();
  return store.subscriptions.filter(isValidSubscription);
}
