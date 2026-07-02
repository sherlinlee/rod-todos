"use client";

import { useCallback, useEffect, useState } from "react";
import {
  REMINDER_MINUTES,
  formatReminderTime,
  getBrowserDefaultReminderPreferences,
  type ReminderPreferences,
} from "@/lib/reminder-prefs";
import {
  describePushError,
  fetchReminderPreferences,
  getBrowserTimezone,
  getCurrentPushSubscription,
  getPushSecureContextError,
  getPushSupportHint,
  isPushSupported,
  saveReminderPreferences,
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

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);

function formatHourLabel(hour: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12} ${period}`;
}

function formatTimezoneLabel(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset =
      parts.find((part) => part.type === "timeZoneName")?.value ?? "";
    return offset ? `${timezone} (${offset})` : timezone;
  } catch {
    return timezone;
  }
}

const selectClassName =
  "rounded-full border border-panel bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80 transition focus:border-accent focus:outline-none";

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supportHint, setSupportHint] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [reminder, setReminder] = useState<ReminderPreferences>(() =>
    getBrowserDefaultReminderPreferences(),
  );
  const [savingReminder, setSavingReminder] = useState(false);

  const loadReminderForSubscription = useCallback(async (subEndpoint: string) => {
    const saved = await fetchReminderPreferences(subEndpoint);
    if (saved) {
      setReminder(saved);
      return;
    }
    setReminder(getBrowserDefaultReminderPreferences());
  }, []);

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
      if (cancelled) return;

      setStatus(next);
      if (next === "enabled") {
        const subscription = await getCurrentPushSubscription();
        if (subscription && !cancelled) {
          setEndpoint(subscription.endpoint);
          await loadReminderForSubscription(subscription.endpoint);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [loadReminderForSubscription]);

  async function persistReminder(next: ReminderPreferences) {
    if (!endpoint) return;
    setSavingReminder(true);
    setError(null);
    const withTimezone = { ...next, timezone: getBrowserTimezone() };
    try {
      const saved = await saveReminderPreferences(endpoint, withTimezone);
      setReminder(saved);
      setMessage(`Reminder set for ${formatReminderTime(saved)}`);
    } catch {
      setError("Could not save reminder time");
    } finally {
      setSavingReminder(false);
    }
  }

  async function enablePush() {
    setError(null);
    setMessage(null);
    setStatus("working");

    const prefs = {
      ...reminder,
      timezone: getBrowserTimezone(),
    };

    try {
      const subEndpoint = await subscribeToPush(prefs);
      setEndpoint(subEndpoint);
      setReminder(prefs);
      setStatus("enabled");
      setMessage(`Reminders on — daily at ${formatReminderTime(prefs)}`);
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
      setEndpoint(null);
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
      const result = await sendTestPush();
      setStatus("enabled");
      setMessage(
        result.shownLocally
          ? `Test sent (${result.sent}/${result.total}) — you should see it now`
          : `Test sent (${result.sent}/${result.total}) — switch away from the app to see the banner`,
      );
    } catch (err) {
      setStatus("enabled");
      const code = err instanceof Error ? err.message : "test_failed";
      if (code === "no_subscriptions") {
        setError("No active subscription — try turning reminders on again");
      } else if (code === "delivery_failed") {
        setError(describePushError(code));
      } else {
        setError("Test notification failed");
      }
    }
  }

  function updateReminderHour(hour: number) {
    const next = { ...reminder, hour };
    setReminder(next);
    if (status === "enabled") void persistReminder(next);
  }

  function updateReminderMinute(minute: number) {
    const next = { ...reminder, minute };
    setReminder(next);
    if (status === "enabled") void persistReminder(next);
  }

  const busy = status === "working" || savingReminder;
  const showEnableButton =
    status === "default" ||
    status === "denied" ||
    status === "not_configured";
  const timezoneLabel = formatTimezoneLabel(getBrowserTimezone());

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
                ? "Morning digest plus per-task pings when you set a time"
                : status === "denied"
                  ? "Allow notifications in your browser settings, then try again"
                  : status === "unsupported"
                    ? supportHint ??
                      "This browser cannot receive push notifications yet"
                    : status === "not_configured"
                      ? "Server push keys are not set up yet"
                      : "Pick a time — we only ping when something is due"}
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
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="reminder-hour">
              Reminder hour
            </label>
            <select
              id="reminder-hour"
              value={reminder.hour}
              onChange={(e) => updateReminderHour(Number(e.target.value))}
              disabled={busy || status === "denied"}
              className={selectClassName}
            >
              {HOUR_OPTIONS.map((hour) => (
                <option key={hour} value={hour}>
                  {formatHourLabel(hour)}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="reminder-minute">
              Reminder minute
            </label>
            <select
              id="reminder-minute"
              value={reminder.minute}
              onChange={(e) => updateReminderMinute(Number(e.target.value))}
              disabled={busy || status === "denied"}
              className={selectClassName}
            >
              {REMINDER_MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  :{String(minute).padStart(2, "0")}
                </option>
              ))}
            </select>

            <span className="text-xs text-foreground/55">{timezoneLabel}</span>
          </div>

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
        </>
      )}
    </section>
  );
}
