"use client";

import type { ReminderStatus } from "@/hooks/useDueReminders";

type ReminderPromptProps = {
  status: ReminderStatus;
  busy: boolean;
  dueDateLabel?: string;
  onEnable: () => void;
  onDismiss: () => void;
};

export default function ReminderPrompt({
  status,
  busy,
  dueDateLabel,
  onEnable,
  onDismiss,
}: ReminderPromptProps) {
  if (status === "loading" || status === "unsupported" || status === "subscribed") {
    return null;
  }

  if (status === "denied") {
    return (
      <div className="mt-3 rounded-xl border border-accent-soft/35 bg-paper px-3 py-2.5 text-xs text-foreground/70">
        <p className="font-semibold text-foreground/85">
          Reminders are blocked on this device
        </p>
        <p className="mt-1 leading-relaxed">
          To get a push on the due date, allow notifications for rod&apos;s to-do(s) in
          your phone settings.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-accent-soft/35 bg-paper px-3 py-2.5">
      <p className="text-xs font-semibold text-foreground/85">
        🔔 Remind you on the due date?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-foreground/65">
        {dueDateLabel
          ? `We'll ping your phone on ${dueDateLabel} for this to-do.`
          : "Turn on push reminders for to-dos with due dates."}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onEnable}
          disabled={busy}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Setting up…" : "Enable reminders"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground/55 transition active:text-foreground/75 disabled:opacity-50"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

type ReminderToggleProps = {
  status: ReminderStatus;
  busy: boolean;
  onEnable: () => void;
  onDisable: () => void;
};

export function ReminderToggle({
  status,
  busy,
  onEnable,
  onDisable,
}: ReminderToggleProps) {
  if (status === "loading" || status === "unsupported") return null;

  const subscribed = status === "subscribed";

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent-soft/50 bg-card/90 px-3.5 py-2 text-xs font-semibold text-foreground/75 shadow-sm backdrop-blur-sm sm:px-4 sm:text-sm">
      <span className="text-lg leading-none" aria-hidden>
        🔔
      </span>
      {subscribed ? (
        <>
          <p>Due-date reminders on</p>
          <button
            type="button"
            onClick={onDisable}
            disabled={busy}
            className="ml-0.5 font-bold text-accent underline-offset-2 hover:underline disabled:opacity-50"
          >
            Off
          </button>
        </>
      ) : status === "denied" ? (
        <p>Reminders blocked — check phone settings</p>
      ) : (
        <>
          <p>Due-date reminders off</p>
          <button
            type="button"
            onClick={onEnable}
            disabled={busy}
            className="ml-0.5 font-bold text-accent underline-offset-2 hover:underline disabled:opacity-50"
          >
            On
          </button>
        </>
      )}
    </div>
  );
}
