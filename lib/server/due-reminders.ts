import { todayStringInTimezone } from "@/lib/dates";
import { loadSyncData } from "@/lib/server/store";
import { loadPushSubscriptions } from "@/lib/server/push-store";
import { sendPush } from "@/lib/server/push-send";
import type { Todo } from "@/lib/types";

function activeDueToday(todos: Todo[], today: string) {
  return todos.filter(
    (todo) =>
      !todo.completed &&
      todo.dueDate === today &&
      typeof todo.text === "string" &&
      todo.text.trim().length > 0,
  );
}

function buildPayload(dueToday: Todo[]) {
  if (dueToday.length === 1) {
    return {
      title: "rod's to-do(s) ⚡",
      body: `Due today: ${dueToday[0].text}`,
      url: "/",
    };
  }

  return {
    title: "rod's to-do(s) ⚡",
    body: `${dueToday.length} to-dos due today — tap to open`,
    url: "/",
  };
}

export async function sendDueDateReminders() {
  const timeZone = process.env.APP_TIMEZONE ?? "UTC";
  const today = todayStringInTimezone(timeZone);

  const [syncData, pushStore] = await Promise.all([
    loadSyncData(),
    loadPushSubscriptions(),
  ]);

  const dueToday = activeDueToday(syncData?.todos ?? [], today);
  if (dueToday.length === 0) {
    return {
      ok: true as const,
      today,
      dueCount: 0,
      sent: 0,
      expired: 0,
      failed: 0,
    };
  }

  if (pushStore.subscriptions.length === 0) {
    return {
      ok: true as const,
      today,
      dueCount: dueToday.length,
      sent: 0,
      expired: 0,
      failed: 0,
      skipped: "no_subscriptions" as const,
    };
  }

  const payload = buildPayload(dueToday);
  let sent = 0;
  let expired = 0;
  let failed = 0;

  for (const subscription of pushStore.subscriptions) {
    const result = await sendPush(subscription, payload);
    if (result === "sent") sent += 1;
    else if (result === "expired") expired += 1;
    else failed += 1;
  }

  return {
    ok: true as const,
    today,
    dueCount: dueToday.length,
    sent,
    expired,
    failed,
  };
}
