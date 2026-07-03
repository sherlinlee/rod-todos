"use client";

import { useEffect, useRef } from "react";
import { flushPendingCloudPush, refreshFromCloud } from "@/lib/sync-client";

const POLL_INTERVAL_MS = 8_000;

export function useCloudRefresh(
  onRefresh: (data: Awaited<ReturnType<typeof refreshFromCloud>>) => void,
) {
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    let disposed = false;
    let inFlight = false;
    let pending = false;

    async function runRefresh() {
      if (document.visibilityState !== "visible") return;

      if (inFlight) {
        pending = true;
        return;
      }

      inFlight = true;
      try {
        do {
          pending = false;
          const data = await refreshFromCloud();
          if (disposed || document.visibilityState !== "visible") break;
          onRefreshRef.current(data);
        } while (pending);
      } catch {
        pending = false;
      } finally {
        inFlight = false;
      }
    }

    function handleRefresh() {
      void runRefresh();
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
      disposed = true;
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("pagehide", flushPendingCloudPush);
      window.clearInterval(pollId);
    };
  }, []);
}
