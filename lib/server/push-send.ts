import webpush from "web-push";
import type { PushMessage, StoredPushSubscription } from "@/lib/push-types";
import { matchesReminderSchedule } from "@/lib/reminder-prefs";
import { ensureWebPushConfigured } from "@/lib/server/push-config";
import {
  listPushSubscriptions,
  removePushSubscription,
} from "@/lib/server/push-store";
import { loadSyncData } from "@/lib/server/store";
import {
  buildDailyReminderMessage,
  buildTaskReminderMessage,
  findTaskRemindersDueNow,
  getSubscriptionReminderPreferences,
  markTodosReminded,
} from "@/lib/server/reminders";
import { todayStringInTimezone } from "@/lib/dates";

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

async function sendTaskRemindersForSubscription(
  subscription: StoredPushSubscription,
  now: Date,
  force: boolean,
) {
  const prefs = getSubscriptionReminderPreferences(subscription);
  const sync = await loadSyncData();
  if (!sync) return { sent: 0, eligible: 0 };

  const matching = findTaskRemindersDueNow(sync, prefs.timezone, now, force);
  if (matching.length === 0) return { sent: 0, eligible: 0 };

  const today = todayStringInTimezone(prefs.timezone);
  const sentTodoIds: string[] = [];

  for (const todo of matching) {
    const ok = await sendPushToSubscription(
      subscription,
      buildTaskReminderMessage(todo),
    );
    if (ok) sentTodoIds.push(todo.id);
  }

  if (sentTodoIds.length > 0) {
    await markTodosReminded(sentTodoIds, today);
  }

  return { sent: sentTodoIds.length, eligible: matching.length };
}

export async function sendDueReminders(now = new Date(), force = false) {
  const subscriptions = await listPushSubscriptions();
  let dailySent = 0;
  let taskSent = 0;
  let dailyEligible = 0;
  let taskEligible = 0;
  let skippedNoTodos = 0;

  for (const subscription of subscriptions) {
    const prefs = getSubscriptionReminderPreferences(subscription);

    if (force || matchesReminderSchedule(prefs, now)) {
      dailyEligible += 1;
      const message = await buildDailyReminderMessage(prefs.timezone);
      if (!message) {
        skippedNoTodos += 1;
      } else {
        const ok = await sendPushToSubscription(subscription, message);
        if (ok) dailySent += 1;
      }
    }

    const taskResult = await sendTaskRemindersForSubscription(
      subscription,
      now,
      force,
    );
    taskEligible += taskResult.eligible;
    taskSent += taskResult.sent;
  }

  return {
    sent: dailySent + taskSent,
    dailySent,
    taskSent,
    total: subscriptions.length,
    eligible: dailyEligible + taskEligible,
    dailyEligible,
    taskEligible,
    skippedNoTodos,
  };
}
