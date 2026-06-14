export type WeatherDay = {
  date: string;
  label: string;
  emoji: string;
  description: string;
  high: number;
  low: number;
  rainSummary: string;
  hours: WeatherHour[];
};

export type WeatherHour = {
  time: string;
  label: string;
  emoji: string;
  description: string;
  precipitation: number;
  probability: number;
  rain: number;
  showers: number;
  isWet: boolean;
};

export type WeatherLocation = {
  latitude: number;
  longitude: number;
  name: string;
};

const LOCATION_KEY = "to-dos-weather-location";

export function loadSavedLocation(): WeatherLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherLocation;
    if (
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      typeof parsed.name === "string"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveLocation(location: WeatherLocation) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function describeWeather(code: number): { emoji: string; description: string } {
  if (code === 0) return { emoji: "☀️", description: "Clear skies" };
  if (code <= 3) return { emoji: "⛅", description: "Partly cloudy" };
  if (code <= 48) return { emoji: "🌫️", description: "Foggy" };
  if (code <= 57) return { emoji: "🌦️", description: "Drizzle" };
  if (code <= 67) return { emoji: "🌧️", description: "Rainy" };
  if (code <= 77) return { emoji: "🌨️", description: "Snowy" };
  if (code <= 82) return { emoji: "🌧️", description: "Showers" };
  if (code <= 86) return { emoji: "🌨️", description: "Snow showers" };
  if (code >= 95) return { emoji: "⛈️", description: "Stormy" };
  return { emoji: "🌤️", description: "Mixed skies" };
}

function dayLabel(isoDate: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function hourLabel(isoDateTime: string) {
  return new Date(isoDateTime).toLocaleTimeString(undefined, {
    hour: "numeric",
    hour12: true,
  }).toLowerCase();
}

function numberAt(values: number[], index: number) {
  const value = values[index];
  return Number.isFinite(value) ? value : 0;
}

function buildRainSummary(hours: WeatherHour[]) {
  const wetHours = hours.filter((hour) => hour.isWet);
  if (wetHours.length === 0) return "No major rain expected";

  let bestStart = 0;
  let bestEnd = 0;
  let currentStart = 0;

  for (let i = 1; i < wetHours.length; i += 1) {
    const previous = new Date(wetHours[i - 1].time).getTime();
    const current = new Date(wetHours[i].time).getTime();
    const isNextHour = current - previous <= 60 * 60 * 1000;

    if (!isNextHour) {
      if (i - 1 - currentStart > bestEnd - bestStart) {
        bestStart = currentStart;
        bestEnd = i - 1;
      }
      currentStart = i;
    }
  }

  if (wetHours.length - 1 - currentStart > bestEnd - bestStart) {
    bestStart = currentStart;
    bestEnd = wetHours.length - 1;
  }

  const start = wetHours[bestStart];
  const end = wetHours[bestEnd];
  if (start.time === end.time) return `Rain likely around ${start.label}`;
  return `Rain likely ${start.label}-${end.label}`;
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      language: "en",
    });
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?${params}`,
    );
    const data = (await res.json()) as {
      results?: { name?: string; admin1?: string; country?: string }[];
    };
    const hit = data.results?.[0];
    if (hit) {
      return [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ");
    }
  } catch {
    /* ignore */
  }
  return "Near you";
}

export async function requestIpLocation(): Promise<WeatherLocation> {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error("IP lookup failed");

  const data = (await res.json()) as {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    country_name?: string;
  };

  if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    throw new Error("IP lookup incomplete");
  }

  const name = [data.city, data.region, data.country_name]
    .filter(Boolean)
    .join(", ");

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    name: name || "Near you",
  };
}

function requestDeviceLocation(): Promise<WeatherLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const name = await reverseGeocode(latitude, longitude);
        resolve({ latitude, longitude, name });
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );
  });
}

export async function detectLocation(): Promise<WeatherLocation> {
  const saved = loadSavedLocation();
  if (saved) return saved;

  const ipLocation = await requestIpLocation().catch(() => null);
  if (ipLocation) return ipLocation;

  return requestDeviceLocation();
}

export async function refineLocation(): Promise<WeatherLocation | null> {
  try {
    return await requestDeviceLocation();
  } catch {
    return null;
  }
}

export async function fetchForecast(
  location: WeatherLocation,
): Promise<WeatherDay[]> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    hourly: "weather_code,precipitation,precipitation_probability,rain,showers",
    timezone: "auto",
    forecast_days: "2",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("Weather fetch failed");

  const data = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
    hourly: {
      time: string[];
      weather_code: number[];
      precipitation: number[];
      precipitation_probability: number[];
      rain: number[];
      showers: number[];
    };
  };

  return data.daily.time.slice(0, 2).map((date, index) => {
    const code = data.daily.weather_code[index];
    const { emoji, description } = describeWeather(code);
    const hours = data.hourly.time
      .map((time, hourIndex) => {
        const hourCode = numberAt(data.hourly.weather_code, hourIndex);
        const precipitation = numberAt(data.hourly.precipitation, hourIndex);
        const probability = numberAt(
          data.hourly.precipitation_probability,
          hourIndex,
        );
        const rain = numberAt(data.hourly.rain, hourIndex);
        const showers = numberAt(data.hourly.showers, hourIndex);
        const weather = describeWeather(hourCode);

        return {
          time,
          label: hourLabel(time),
          emoji: weather.emoji,
          description: weather.description,
          precipitation,
          probability,
          rain,
          showers,
          isWet:
            probability >= 50 ||
            precipitation >= 0.2 ||
            rain >= 0.2 ||
            showers >= 0.2,
        };
      })
      .filter((hour) => hour.time.startsWith(date));

    return {
      date,
      label: dayLabel(date, index),
      emoji,
      description,
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index]),
      rainSummary: buildRainSummary(hours),
      hours,
    };
  });
}
