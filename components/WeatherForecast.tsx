"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectLocation,
  fetchForecast,
  refineLocation,
  saveLocation,
  type WeatherDay,
  type WeatherLocation,
} from "@/lib/weather";

type WeatherState =
  | { status: "loading" }
  | { status: "ready"; location: WeatherLocation; days: WeatherDay[] }
  | { status: "error" };

export default function WeatherForecast() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });

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
    </div>
  );
}
