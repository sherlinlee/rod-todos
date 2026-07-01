"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import SiteAvatar from "@/components/SiteAvatar";
import { formatSiteDecor, getSiteConfig } from "@/lib/site";

export default function PinLogin() {
  const site = getSiteConfig();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function focusIndex(index: number) {
    inputsRef.current[index]?.focus();
  }

  function handleChange(index: number, value: string) {
    const next = value.replace(/\D/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = next;
    setDigits(updated);
    setError(false);

    if (next && index < 5) {
      focusIndex(index + 1);
    }

    if (updated.every((d) => d !== "") && updated.join("").length === 6) {
      void submitPin(updated.join(""));
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
  }

  function handlePaste(text: string) {
    const cleaned = text.replace(/\D/g, "").slice(0, 6);
    if (!cleaned) return;

    const updated = ["", "", "", "", "", ""];
    for (let i = 0; i < cleaned.length; i += 1) {
      updated[i] = cleaned[i] ?? "";
    }
    setDigits(updated);
    setError(false);

    if (cleaned.length === 6) {
      void submitPin(cleaned);
      return;
    }

    focusIndex(Math.min(cleaned.length, 5));
  }

  async function submitPin(value: string) {
    if (submitting) return;
    setSubmitting(true);
    setError(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pin: value }),
      });

      if (!res.ok) {
        setDigits(["", "", "", "", "", ""]);
        setError(true);
        focusIndex(0);
        return;
      }

      const from = searchParams.get("from") || "/";
      router.replace(from);
      router.refresh();
    } catch {
      setDigits(["", "", "", "", "", ""]);
      setError(true);
      focusIndex(0);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="safe-px safe-pt safe-pb mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-panel bg-card/90 p-6 text-center shadow-[0_12px_40px_var(--shadow)] backdrop-blur-sm sm:p-8">
        <div className="mb-5 flex flex-col items-center gap-2.5">
          <SiteAvatar size={44} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
              {formatSiteDecor(site.loginHeading, site.loginDecor)}
            </p>
            <h1 className="mt-1 text-xl font-bold text-foreground">
              enter your pin
            </h1>
          </div>
        </div>

        <p className="mb-5 text-sm text-foreground/55">
          6 digits to peek inside
        </p>

        <div
          className="mb-4 flex justify-center gap-2 sm:gap-2.5"
          onPaste={(e) => {
            e.preventDefault();
            handlePaste(e.clipboardData.getData("text"));
          }}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              disabled={submitting}
              aria-label={`PIN digit ${index + 1}`}
              className={`h-12 w-10 rounded-xl border-2 bg-surface text-center text-lg font-bold outline-none transition sm:h-14 sm:w-12 ${
                error
                  ? "border-red-300 shake-pin"
                  : digit
                    ? "border-accent text-foreground"
                    : "border-accent-soft/60 text-foreground"
              }`}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e.key)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        {error && (
          <p className="animate-fade-in text-center text-sm font-semibold text-red-400">
            hmm, that pin didn&apos;t work — try again?
          </p>
        )}

        {submitting && (
          <p className="mt-2 text-center text-xs font-semibold text-foreground/45">
            unlocking…
          </p>
        )}
      </div>
    </div>
  );
}
