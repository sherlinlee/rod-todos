import type { ReminderPreferences } from "@/lib/reminder-prefs";

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
  reminder?: ReminderPreferences;
};

export type StoredPushSubscription = PushSubscriptionPayload & {
  createdAt: number;
  userAgent?: string;
};

export type PushStoreData = {
  subscriptions: StoredPushSubscription[];
};

export type PushMessage = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};
