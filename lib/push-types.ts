export type PushSubscriptionRecord = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: number;
};

export type PushSubscriptionStore = {
  subscriptions: PushSubscriptionRecord[];
  updatedAt: number;
};

export type PushSubscribePayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};
