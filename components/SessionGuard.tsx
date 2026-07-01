"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SESSION_INACTIVITY_MS } from "@/lib/auth";
import {
  clearPinVerified,
  handlePageHideForReauth,
  isPinVerified,
} from "@/lib/session-client";

const ACTIVITY_PING_MS = 30_000;

async function logoutToLogin() {
  clearPinVerified();
  try {
    await fetch("/api/auth", { method: "DELETE" });
  } catch {
    /* ignore */
  }
  window.location.href = "/login";
}

async function pingActivity() {
  try {
    const res = await fetch("/api/auth/activity", { method: "POST" });
    if (res.status === 401) {
      await logoutToLogin();
    }
  } catch {
    /* ignore transient network errors */
  }
}

export default function SessionGuard() {
  const pathname = usePathname();
  const idleTimerRef = useRef<number | null>(null);
  const lastPingRef = useRef(0);
  const accessGrantedRef = useRef(false);

  useEffect(() => {
    if (pathname === "/login") return;

    async function enforceAccess() {
      if (!isPinVerified()) {
        await logoutToLogin();
        return false;
      }
      return true;
    }

    function scheduleIdleLogout() {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        void logoutToLogin();
      }, SESSION_INACTIVITY_MS);
    }

    function maybePingActivity() {
      const now = Date.now();
      if (now - lastPingRef.current < ACTIVITY_PING_MS) return;
      lastPingRef.current = now;
      void pingActivity();
    }

    function handleActivity() {
      if (!accessGrantedRef.current) return;
      scheduleIdleLogout();
      maybePingActivity();
    }

    function handlePageHide() {
      handlePageHideForReauth();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        handlePageHideForReauth();
        return;
      }

      if (!isPinVerified()) {
        void logoutToLogin();
        return;
      }

      if (accessGrantedRef.current) {
        void pingActivity().then(() => scheduleIdleLogout());
      }
    }

    void enforceAccess().then((granted) => {
      if (!granted) return;
      accessGrantedRef.current = true;
      scheduleIdleLogout();
      void pingActivity();
    });

    window.addEventListener("pagehide", handlePageHide);

    const events: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "scroll",
      "focusin",
    ];

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      accessGrantedRef.current = false;
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [pathname]);

  return null;
}
