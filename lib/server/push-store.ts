import { get, put } from "@vercel/blob";
import type {
  PushSubscriptionRecord,
  PushSubscriptionStore,
} from "@/lib/push-types";

const BLOB_PATHNAME = "rod-push-subscriptions.json";

function blobConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

export async function loadPushSubscriptions(): Promise<PushSubscriptionStore> {
  if (!blobConfigured()) {
    return { subscriptions: [], updatedAt: 0 };
  }

  try {
    const result = await get(BLOB_PATHNAME, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return { subscriptions: [], updatedAt: 0 };
    }

    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text) as PushSubscriptionStore;
    if (!Array.isArray(parsed.subscriptions)) {
      return { subscriptions: [], updatedAt: 0 };
    }
    return parsed;
  } catch {
    return { subscriptions: [], updatedAt: 0 };
  }
}

export async function savePushSubscriptions(
  store: PushSubscriptionStore,
): Promise<boolean> {
  if (!blobConfigured()) return false;

  try {
    await put(BLOB_PATHNAME, JSON.stringify(store), {
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

export async function upsertPushSubscription(
  record: PushSubscriptionRecord,
): Promise<boolean> {
  const store = await loadPushSubscriptions();
  const next = store.subscriptions.filter(
    (sub) => sub.endpoint !== record.endpoint,
  );
  next.push(record);
  return savePushSubscriptions({
    subscriptions: next,
    updatedAt: Date.now(),
  });
}

export async function removePushSubscription(
  endpoint: string,
): Promise<boolean> {
  const store = await loadPushSubscriptions();
  const next = store.subscriptions.filter((sub) => sub.endpoint !== endpoint);
  if (next.length === store.subscriptions.length) return true;
  return savePushSubscriptions({
    subscriptions: next,
    updatedAt: Date.now(),
  });
}

export function isPushStorageConfigured() {
  return blobConfigured();
}
