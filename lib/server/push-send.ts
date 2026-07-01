import webpush from "web-push";
import type { PushSubscriptionRecord } from "@/lib/push-types";
import { removePushSubscription } from "@/lib/server/push-store";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:rod@localhost";

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export async function sendPush(
  subscription: PushSubscriptionRecord,
  payload: PushPayload,
): Promise<"sent" | "expired" | "failed"> {
  if (!configureWebPush()) return "failed";

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
    );
    return "sent";
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await removePushSubscription(subscription.endpoint);
      return "expired";
    }
    return "failed";
  }
}
