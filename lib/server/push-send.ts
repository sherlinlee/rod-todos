import webpush from "web-push";
import type { PushMessage, StoredPushSubscription } from "@/lib/push-types";
import { ensureWebPushConfigured } from "@/lib/server/push-config";
import {
  listPushSubscriptions,
  removePushSubscription,
} from "@/lib/server/push-store";

function toWebPushSubscription(subscription: StoredPushSubscription) {
  return {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  };
}

export async function sendPushToSubscription(
  subscription: StoredPushSubscription,
  message: PushMessage,
): Promise<boolean> {
  if (!ensureWebPushConfigured()) return false;

  try {
    await webpush.sendNotification(
      toWebPushSubscription(subscription),
      JSON.stringify(message),
    );
    return true;
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode)
        : 0;

    if (statusCode === 404 || statusCode === 410) {
      await removePushSubscription(subscription.endpoint);
    }

    return false;
  }
}

export async function sendPushToAll(message: PushMessage) {
  const subscriptions = await listPushSubscriptions();
  let sent = 0;

  for (const subscription of subscriptions) {
    const ok = await sendPushToSubscription(subscription, message);
    if (ok) sent += 1;
  }

  return { sent, total: subscriptions.length };
}
