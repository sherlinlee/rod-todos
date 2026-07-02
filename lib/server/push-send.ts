import webpush from "web-push";
import type { PushMessage, StoredPushSubscription } from "@/lib/push-types";
import { matchesReminderSchedule } from "@/lib/reminder-prefs";
import { ensureWebPushConfigured } from "@/lib/server/push-config";
import {
  listPushSubscriptions,
  removePushSubscription,
} from "@/lib/server/push-store";
import {
  buildDailyReminderMessage,
  getSubscriptionReminderPreferences,
} from "@/lib/server/reminders";

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

export async function sendDueReminders(now = new Date(), force = false) {
  const subscriptions = await listPushSubscriptions();
  let sent = 0;
  let eligible = 0;
  let skippedNoTodos = 0;

  for (const subscription of subscriptions) {
    const prefs = getSubscriptionReminderPreferences(subscription);
    if (!force && !matchesReminderSchedule(prefs, now)) continue;

    eligible += 1;
    const message = await buildDailyReminderMessage(prefs.timezone);
    if (!message) {
      skippedNoTodos += 1;
      continue;
    }

    const ok = await sendPushToSubscription(subscription, message);
    if (ok) sent += 1;
  }

  return {
    sent,
    total: subscriptions.length,
    eligible,
    skippedNoTodos,
  };
}
