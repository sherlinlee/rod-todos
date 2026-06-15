"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectLocation,
  fetchForecast,
  refineLocation,
  saveLocation,
  type WeatherDay,
  type WeatherHour,
  type WeatherLocation,
} from "@/lib/weather";

type WeatherState =
  | { status: "loading" }
  | { status: "ready"; location: WeatherLocation; days: WeatherDay[] }
  | { status: "error" };

function RainPill({ text }: { text: string }) {
  return (
    <span className="shrink-0 rounded-full border border-accent-soft/30 bg-card/80 px-2 py-0.5 text-[10px] font-semibold text-foreground/60">
      {text}
    </span>
  );
}

function HourlyRain({ hours }: { hours: WeatherHour[] }) {
  const now = Date.now();
  const visibleHours = hours.filter(
    (hour) => new Date(hour.time).getTime() >= now - 60 * 60 * 1000,
  );
  const timeline = visibleHours.length > 0 ? visibleHours : hours;

  return (
    <div className="scroll-chips mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5">
      {timeline.map((hour) => (
        <div
          key={hour.time}
          className="paper-slip flex min-w-[2.75rem] shrink-0 flex-col items-center rounded-xl border border-accent-soft/30 px-1.5 py-1 text-center"
          title={`${hour.description}, ${hour.probability}% rain, ${hour.precipitation.toFixed(1)}mm`}
        >
          <p className="text-[10px] font-semibold text-foreground/45">
            {hour.label}
          </p>
          <p className="my-0.5 text-base leading-none" aria-hidden>
            {hour.emoji}
          </p>
          <p className="text-[11px] font-bold text-foreground">
            {hour.probability}%
          </p>
          <p className="text-[9px] font-semibold text-foreground/40">
            {hour.precipitation.toFixed(1)}mm
          </p>
        </div>
      ))}
    </div>
  );
}

export default function WeatherForecast() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const [showTomorrowHours, setShowTomorrowHours] = useState(false);

  const loadWeather = useCallback(async (location: WeatherLocation) => {
    const days = await fetchForecast(location);
    saveLocation(location);
    setState({ status: "ready", location, days });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const location = await detectLocation();
        if (cancelled) return;
        await loadWeather(location);

        const precise = await refineLocation();
        if (cancelled || !precise) return;

        const moved =
          Math.abs(precise.latitude - location.latitude) > 0.05 ||
          Math.abs(precise.longitude - location.longitude) > 0.05;

        if (moved) {
          await loadWeather(precise);
        }
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [loadWeather]);

  if (state.status === "loading") {
    return (
      <div className="rounded-xl section-sky px-3 py-2 text-center text-xs font-semibold text-foreground/45">
        Checking the skies…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl section-sky px-3 py-2 text-center text-xs font-semibold text-foreground/45">
        Weather is taking a little nap
      </div>
    );
  }

  const [today, tomorrow] = state.days;

  return (
    <div className="rounded-xl border border-accent-soft/25 section-sky p-2.5 shadow-sm backdrop-blur-sm sm:p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-foreground/65">🌤️ Weather</p>
        <p className="min-w-0 truncate text-[10px] font-semibold text-foreground/40">
          {state.location.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {state.days.map((day) => (
          <div
            key={day.date}
            className="paper-slip rounded-xl border border-accent-soft/30 px-2 py-2 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
              {day.label}
            </p>
            <p className="text-xl leading-none">{day.emoji}</p>
            <p className="mt-0.5 text-xs font-bold text-foreground">
              {day.high}° / {day.low}°
            </p>
            <p className="truncate text-[10px] font-semibold text-foreground/50">
              {day.description}
            </p>
          </div>
        ))}
      </div>

      {today && (
        <div className="paper-slip mt-1.5 rounded-xl border border-accent-soft/30 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
              Today rain by hour
            </p>
            <RainPill text={today.rainSummary} />
          </div>
          <HourlyRain hours={today.hours} />
        </div>
      )}

      {tomorrow && (
        <div className="paper-slip mt-1.5 rounded-xl border border-accent-soft/30 px-2.5 py-2">
          <button
            type="button"
            onClick={() => setShowTomorrowHours((show) => !show)}
            className="flex w-full items-center justify-between gap-2 text-left transition active:opacity-80"
            aria-expanded={showTomorrowHours}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
              Tomorrow rain by hour
            </p>
            <span className="flex items-center gap-1">
              {!showTomorrowHours && <RainPill text={tomorrow.rainSummary} />}
              <span className="text-xs text-foreground/45" aria-hidden>
                {showTomorrowHours ? "▲" : "▼"}
              </span>
            </span>
          </button>
          {showTomorrowHours && (
            <>
              <div className="mt-1 flex justify-end">
                <RainPill text={tomorrow.rainSummary} />
              </div>
              <HourlyRain hours={tomorrow.hours} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
