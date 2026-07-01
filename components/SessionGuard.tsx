"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SESSION_INACTIVITY_MS } from "@/lib/auth";

const ACTIVITY_PING_MS = 30_000;

async function logoutToLogin() {
  try {
    await fetch("/api/auth", { method: "DELETE", credentials: "include" });
  } catch {
    /* ignore */
  }
  window.location.href = "/login";
}

async function pingActivity(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/activity", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return true;
  }
}

/** Keeps the httpOnly session alive while the app is open. */
export default function SessionGuard() {
  const pathname = usePathname();
  const idleTimerRef = useRef<number | null>(null);
  const lastPingRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    if (pathname === "/login") return;

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
      void pingActivity().then((ok) => {
        if (!ok && activeRef.current) {
          void logoutToLogin();
        }
      });
    }

    function handleActivity() {
      if (!activeRef.current) return;
      scheduleIdleLogout();
      maybePingActivity();
    }

    activeRef.current = true;
    scheduleIdleLogout();
    void pingActivity().then((ok) => {
      if (!ok) void logoutToLogin();
    });

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

    return () => {
      activeRef.current = false;
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [pathname]);

  return null;
}
