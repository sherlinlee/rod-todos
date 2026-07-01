"use client";

import { useCallback, useEffect, useState } from "react";
import { getSiteConfig, type WeatherTheme } from "@/lib/site";
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

function RainPill({ text, theme }: { text: string; theme: WeatherTheme }) {
  return <span className={theme.rainPill}>{text}</span>;
}

function HourlyRain({
  hours,
  theme,
  isTomorrow = false,
}: {
  hours: WeatherHour[];
  theme: WeatherTheme;
  isTomorrow?: boolean;
}) {
  const now = Date.now();
  const visibleHours = hours.filter(
    (hour) => new Date(hour.time).getTime() >= now - 60 * 60 * 1000,
  );
  const timeline = visibleHours.length > 0 ? visibleHours : hours;
  const cardClass = isTomorrow ? theme.hourlyTomorrowCard : theme.hourlyTodayCard;

  return (
    <div className="scroll-chips mt-1 flex gap-0.5 overflow-x-auto pb-0.5">
      {timeline.map((hour) => (
        <div
          key={hour.time}
          className={cardClass}
          title={`${hour.description}, ${hour.probability}% rain, ${hour.precipitation.toFixed(1)}mm`}
        >
          <p className={theme.hourlyLabel}>{hour.label}</p>
          <p className="text-xs leading-none">{hour.emoji}</p>
          <p className={theme.hourlyProb}>{hour.probability}%</p>
          <p className={theme.hourlyMm}>{hour.precipitation.toFixed(1)}mm</p>
        </div>
      ))}
    </div>
  );
}

function DayCard({ day, theme }: { day: WeatherDay; theme: WeatherTheme }) {
  return (
    <div className={theme.dayCard}>
      <p className={theme.dayLabel}>{day.label}</p>
      <p className="weather-day-row">
        <span className="weather-day-emoji" aria-hidden>
          {day.emoji}
        </span>
        <span className="weather-day-temps">
          <span className={theme.dayTempHigh}>{day.high}°</span>
          <span className={theme.dayTempLow}> / {day.low}°</span>
        </span>
      </p>
      <p className={theme.dayDesc}>{day.description}</p>
    </div>
  );
}

function WeatherShell({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: WeatherTheme;
}) {
  return <div className={theme.shell}>{children}</div>;
}

export default function WeatherForecast() {
  const theme = getSiteConfig().weather;
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
      <WeatherShell theme={theme}>
        <p className={theme.loadingText}>Checking the skies…</p>
      </WeatherShell>
    );
  }

  if (state.status === "error") {
    return (
      <WeatherShell theme={theme}>
        <p className={theme.loadingText}>Weather is taking a little nap</p>
      </WeatherShell>
    );
  }

  return (
    <WeatherShell theme={theme}>
      <div className="mb-1 flex items-center justify-between gap-1">
        <p className={theme.headerTitle}>🌤️ Weather</p>
        <p className={theme.headerLocation}>{state.location.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-0.5">
        {state.days.map((day) => (
          <DayCard key={day.date} day={day} theme={theme} />
        ))}
      </div>

      <div className="mt-1 space-y-1">
        {state.days.map((day, index) => (
          <div key={`${day.date}-hourly`} className="px-0 py-0.5">
            {index === 0 ? (
              <>
                <div className="flex items-center justify-between gap-1">
                  <p className={theme.sectionTitle}>Today rain by hour</p>
                  <RainPill text={day.rainSummary} theme={theme} />
                </div>
                <HourlyRain hours={day.hours} theme={theme} />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowTomorrowHours((show) => !show)}
                  className="flex w-full items-center justify-between gap-1 text-left"
                  aria-expanded={showTomorrowHours}
                >
                  <span className={theme.sectionTitle}>Tomorrow rain by hour</span>
                  <span className="flex items-center gap-0.5">
                    {!showTomorrowHours && (
                      <RainPill text={day.rainSummary} theme={theme} />
                    )}
                    {showTomorrowHours && (
                      <span className={theme.hideLink}>Hide</span>
                    )}
                  </span>
                </button>
                {showTomorrowHours && (
                  <>
                    <div className="mt-0.5 flex justify-end">
                      <RainPill text={day.rainSummary} theme={theme} />
                    </div>
                    <HourlyRain hours={day.hours} theme={theme} isTomorrow />
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </WeatherShell>
  );
}
