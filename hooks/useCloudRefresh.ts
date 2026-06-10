"use client";

import { useEffect } from "react";
import { flushPendingCloudPush, refreshFromCloud } from "@/lib/sync-client";

const POLL_INTERVAL_MS = 8_000;

export function useCloudRefresh(onRefresh: (data: Awaited<ReturnType<typeof refreshFromCloud>>) => void) {
  useEffect(() => {
    function handleRefresh() {
      if (document.visibilityState !== "visible") return;
      void refreshFromCloud().then(onRefresh);
    }

    function handleHidden() {
      if (document.visibilityState !== "hidden") return;
      flushPendingCloudPush();
    }

    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);
    document.addEventListener("visibilitychange", handleHidden);
    window.addEventListener("pagehide", flushPendingCloudPush);

    const pollId = window.setInterval(handleRefresh, POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("pagehide", flushPendingCloudPush);
      window.clearInterval(pollId);
    };
  }, [onRefresh]);
}
