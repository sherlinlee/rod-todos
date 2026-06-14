"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from "lucide-react";
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

const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]";
const dayCardClass = "rounded-lg bg-[#4A4A4A]";
const sectionCardClass = "rounded-lg bg-[#4A4A4A]";

const SUN_COLOR = "text-[#FBBF24]";
const CLOUD_COLOR = "text-white";
const RAIN_COLOR = "text-[#93C5FD]";

function iconProps(size: number, className: string) {
  return {
    size,
    strokeWidth: 1.75,
    className,
    "aria-hidden": true as const,
  };
}

function PartlyCloudyIcon({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Sun
        {...iconProps(Math.round(size * 0.55), `absolute left-0 top-0 ${SUN_COLOR}`)}
      />
      <Cloud {...iconProps(size, `relative ${CLOUD_COLOR}`)} />
    </span>
  );
}

function WeatherIcon({
  description,
  size = 24,
}: {
  description: string;
  size?: number;
  className?: string;
}) {
  const kind = description.toLowerCase();

  if (kind.includes("clear")) {
    return <Sun {...iconProps(size, SUN_COLOR)} />;
  }
  if (kind.includes("partly")) {
    return <PartlyCloudyIcon size={size} />;
  }
  if (kind.includes("fog")) {
    return <CloudFog {...iconProps(size, CLOUD_COLOR)} />;
  }
  if (kind.includes("drizzle")) {
    return <CloudDrizzle {...iconProps(size, RAIN_COLOR)} />;
  }
  if (kind.includes("storm")) {
    return <CloudLightning {...iconProps(size, RAIN_COLOR)} />;
  }
  if (kind.includes("snow")) {
    return <CloudSnow {...iconProps(size, CLOUD_COLOR)} />;
  }
  if (kind.includes("rain") || kind.includes("shower")) {
    return <CloudRain {...iconProps(size, RAIN_COLOR)} />;
  }
  if (kind.includes("mixed")) {
    return <Cloud {...iconProps(size, CLOUD_COLOR)} />;
  }
  return <PartlyCloudyIcon size={size} />;
}

function RainPill({ text }: { text: string }) {
  return (
    <span className="shrink-0 rounded-[20px] bg-white/10 px-2 py-0.5 text-[10px] font-medium text-[#D1D5DB]">
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
          className="flex min-w-[2.75rem] shrink-0 flex-col items-center rounded-lg bg-[#4A4A4A] px-1.5 py-1 text-center"
          title={`${hour.description}, ${hour.probability}% rain, ${hour.precipitation.toFixed(1)}mm`}
        >
          <p className="text-[10px] text-[#9CA3AF]">{hour.label}</p>
          <div className="my-0.5">
            <WeatherIcon description={hour.description} size={14} />
          </div>
          <p className="text-[11px] font-semibold text-[#F9FAFB]">
            {hour.probability}%
          </p>
          <p className="text-[9px] text-[#6B7280]">
            {hour.precipitation.toFixed(1)}mm
          </p>
        </div>
      ))}
    </div>
  );
}

function DayCard({ day }: { day: WeatherDay }) {
  return (
    <div className={`${dayCardClass} px-2.5 py-2`}>
      <p className={labelClass}>{day.label}</p>
      <div className="mt-1 flex items-center gap-2">
        <WeatherIcon description={day.description} size={20} />
        <div className="min-w-0">
          <p className="leading-none">
            <span className="text-[17px] font-medium text-[#F9FAFB]">
              {day.high}°
            </span>
            <span className="text-[13px] text-[#9CA3AF]"> / {day.low}°</span>
          </p>
          <p className="mt-0.5 truncate text-[10px] text-[#93C5FD]">
            {day.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function WeatherShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] bg-[#383838] p-3">{children}</div>
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
      <WeatherShell>
        <p className="py-1 text-center text-[10px] font-medium text-[#9CA3AF]">
          Checking the skies…
        </p>
      </WeatherShell>
    );
  }

  if (state.status === "error") {
    return (
      <WeatherShell>
        <p className="py-1 text-center text-[10px] font-medium text-[#9CA3AF]">
          Weather is taking a little nap
        </p>
      </WeatherShell>
    );
  }

  const [today, tomorrow] = state.days;

  return (
    <WeatherShell>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <WeatherIcon description="Partly cloudy" size={14} />
          <p className="text-[11px] font-medium text-[#F9FAFB]">Weather</p>
        </div>
        <p className="min-w-0 truncate text-[10px] text-[#9CA3AF]">
          {state.location.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {state.days.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>

      {today && (
        <div className={`${sectionCardClass} mt-1.5 px-2.5 py-2`}>
          <div className="flex items-center justify-between gap-2">
            <p className={labelClass}>Today rain by hour</p>
            <RainPill text={today.rainSummary} />
          </div>
          <HourlyRain hours={today.hours} />
        </div>
      )}

      {tomorrow && (
        <div className={`${sectionCardClass} mt-1.5 px-2.5 py-2`}>
          <button
            type="button"
            onClick={() => setShowTomorrowHours((show) => !show)}
            className="flex w-full items-center justify-between gap-2 text-left transition active:opacity-80"
            aria-expanded={showTomorrowHours}
          >
            <p className={labelClass}>Tomorrow rain by hour</p>
            <span className="flex items-center gap-1">
              {!showTomorrowHours && <RainPill text={tomorrow.rainSummary} />}
              {showTomorrowHours ? (
                <ChevronUp className="size-3.5 text-[#9CA3AF]" aria-hidden />
              ) : (
                <ChevronDown className="size-3.5 text-[#9CA3AF]" aria-hidden />
              )}
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
    </WeatherShell>
  );
}
