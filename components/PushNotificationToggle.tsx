"use client";

import { useEffect, useState } from "react";
import {
  describePushError,
  getPushSecureContextError,
  getPushSupportHint,
  isPushSupported,
  sendTestPush,
  subscribeToPush,
  syncPushSubscriptionState,
  unsubscribeFromPush,
} from "@/lib/push-client";

type PushStatus =
  | "loading"
  | "unsupported"
  | "not_configured"
  | "default"
  | "denied"
  | "enabled"
  | "working";

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supportHint, setSupportHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const secureContextError = getPushSecureContextError();
      if (secureContextError) {
        if (!cancelled) {
          setStatus("unsupported");
          setSupportHint(secureContextError);
        }
        return;
      }

      if (!isPushSupported()) {
        if (!cancelled) {
          setStatus("unsupported");
          setSupportHint(getPushSupportHint());
        }
        return;
      }

      try {
        const res = await fetch("/api/push/subscribe", { cache: "no-store" });
        if (res.status === 401) {
          if (!cancelled) setStatus("default");
          return;
        }
        const json = (await res.json()) as {
          ok: boolean;
          configured?: boolean;
          configError?: string | null;
        };
        if (!json.ok || !json.configured) {
          if (!cancelled) {
            setStatus("not_configured");
            setError(
              json.configError
                ? describePushError(json.configError)
                : "Push keys missing on the server — add VAPID env vars and redeploy.",
            );
          }
          return;
        }
      } catch {
        if (!cancelled) {
          setStatus("not_configured");
          setError("Could not reach push config on the server.");
        }
        return;
      }

      const next = await syncPushSubscriptionState();
      if (!cancelled) setStatus(next);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enablePush() {
    setError(null);
    setMessage(null);
    setStatus("working");

    try {
      await subscribeToPush();
      setStatus("enabled");
      setMessage("Reminders turned on");
    } catch (err) {
      const code = err instanceof Error ? err.message : "failed";
      if (code === "denied") {
        setStatus("denied");
      } else if (code === "not_configured" || code === "missing_env") {
        setStatus("not_configured");
      } else if (code === "unsupported" || code === "insecure_context") {
        setStatus("unsupported");
        setSupportHint(describePushError(code));
      } else {
        setStatus("default");
      }
      setError(describePushError(code));
    }
  }

  async function disablePush() {
    setError(null);
    setMessage(null);
    setStatus("working");

    try {
      await unsubscribeFromPush();
      setStatus("default");
      setMessage("Reminders turned off");
    } catch {
      setStatus("enabled");
      setError("Could not turn off notifications");
    }
  }

  async function testPush() {
    setError(null);
    setMessage(null);
    setStatus("working");

    try {
      await sendTestPush();
      setStatus("enabled");
      setMessage("Test notification sent");
    } catch (err) {
      setStatus("enabled");
      const code = err instanceof Error ? err.message : "test_failed";
      if (code === "no_subscriptions") {
        setError("No active subscription — try turning reminders on again");
      } else {
        setError("Test notification failed");
      }
    }
  }

  const busy = status === "working";
  const showEnableButton =
    status === "default" ||
    status === "denied" ||
    status === "not_configured";

  return (
    <section className="mb-3 rounded-2xl border border-panel bg-card/90 p-3 shadow-[0_12px_32px_var(--shadow)] backdrop-blur-sm sm:mb-4 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground/55">
            push reminders
          </p>
          <p className="mt-1 text-sm text-foreground/70">
            {status === "loading"
              ? "Checking notification support…"
              : status === "enabled"
                ? "Daily nudge for due and overdue to-dos"
                : status === "denied"
                  ? "Allow notifications in your browser settings, then try again"
                  : status === "unsupported"
                    ? supportHint ??
                      "This browser cannot receive push notifications yet"
                    : status === "not_configured"
                      ? "Server push keys are not set up yet"
                      : "Get a morning ping when something is due"}
          </p>
          {message && (
            <p className="mt-1 text-xs font-semibold text-forest">{message}</p>
          )}
          {error && (
            <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>
          )}
        </div>
        <span className="text-xl" aria-hidden>
          🔔
        </span>
      </div>

      {status !== "unsupported" && status !== "loading" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {status === "enabled" ? (
            <>
              <button
                type="button"
                onClick={() => void testPush()}
                disabled={busy}
                className="rounded-full bg-accent-soft/50 px-3 py-1.5 text-xs font-bold text-accent transition active:scale-95 disabled:opacity-60"
              >
                Send test
              </button>
              <button
                type="button"
                onClick={() => void disablePush()}
                disabled={busy}
                className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground/60 transition active:scale-95 disabled:opacity-60"
              >
                Turn off
              </button>
            </>
          ) : showEnableButton ? (
            <button
              type="button"
              onClick={() => void enablePush()}
              disabled={busy || status === "denied"}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-on-accent transition active:scale-95 disabled:opacity-60"
            >
              {busy ? "Working…" : "Turn on reminders"}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
