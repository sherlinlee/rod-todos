"use client";

import { useEffect } from "react";
import { refreshFromCloud } from "@/lib/sync-client";

export function useCloudRefresh(onRefresh: (data: Awaited<ReturnType<typeof refreshFromCloud>>) => void) {
  useEffect(() => {
    function handleRefresh() {
      if (document.visibilityState !== "visible") return;
      void refreshFromCloud().then(onRefresh);
    }

    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, [onRefresh]);
}
