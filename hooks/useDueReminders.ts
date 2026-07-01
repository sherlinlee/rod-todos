"use client";

import { useCallback, useEffect, useState } from "react";
import {
  hasActivePushSubscription,
  isPushSupported,
  pushPermission,
  subscribeToDueReminders,
  unsubscribeFromDueReminders,
} from "@/lib/push-client";

export type ReminderStatus =
  | "loading"
  | "unsupported"
  | "default"
  | "denied"
  | "subscribed";

export function useDueReminders() {
  const [status, setStatus] = useState<ReminderStatus>("loading");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }

    const permission = pushPermission();
    if (permission === "denied") {
      setStatus("denied");
      return;
    }

    const active = await hasActivePushSubscription();
    setStatus(active ? "subscribed" : "default");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const result = await subscribeToDueReminders();
      if (result === "granted") setStatus("subscribed");
      else if (result === "denied") setStatus("denied");
      else setStatus("default");
      return result;
    } finally {
      setBusy(false);
    }
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      await unsubscribeFromDueReminders();
      setStatus("default");
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    status,
    busy,
    refresh,
    enable,
    disable,
    supported: status !== "unsupported",
  };
}
