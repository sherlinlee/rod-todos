export type SiteOwner = "rod";

export type WeatherTheme = {
  shell: string;
  loadingText: string;
  headerTitle: string;
  headerLocation: string;
  sectionTitle: string;
  rainPill: string;
  hideLink: string;
  dayCard: string;
  dayLabel: string;
  dayTempHigh: string;
  dayTempLow: string;
  dayDesc: string;
  hourlyTodayCard: string;
  hourlyTomorrowCard: string;
  hourlyLabel: string;
  hourlyProb: string;
  hourlyMm: string;
};

export type SiteConfig = {
  owner: SiteOwner;
  appName: string;
  title: string;
  description: string;
  loginHeading: string;
  loginDecor: string;
  homeTagline: string;
  homeSubtitle: string;
  homeAvatar: "emoji";
  homeAvatarEmoji: string;
  navTodoEmoji: string;
  notesTagline: string;
  ideasTagline: string;
  notesSavedHint: string;
  emptyCompletedEmoji: string;
  allDoneFooter: string;
  celebrationEmoji: string;
  syncBlobName: string;
  pushBlobName: string;
  themeColor: string;
  manifestBackground: string;
  weather: WeatherTheme;
};

const rodWeather: WeatherTheme = {
  shell: "wx-shell-rod sm:p-2.5",
  loadingText: "py-1 text-center text-[10px] font-semibold text-foreground/55",
  headerTitle: "text-[11px] font-semibold text-foreground/70",
  headerLocation: "min-w-0 truncate text-[9px] font-medium text-foreground/50",
  sectionTitle: "wx-title-rod",
  rainPill: "wx-pill-rod shrink-0",
  hideLink: "text-[8px] font-semibold text-foreground/55",
  dayCard: "wx-card-rod",
  dayLabel:
    "text-center text-[8px] font-bold uppercase tracking-wide text-foreground/55",
  dayTempHigh: "wx-temp-high-rod",
  dayTempLow: "text-[10px] text-foreground/50",
  dayDesc:
    "truncate text-center text-[8px] font-semibold text-foreground/55",
  hourlyTodayCard: "wx-hour-today-rod",
  hourlyTomorrowCard: "wx-hour-tomorrow-rod",
  hourlyLabel:
    "text-[8px] font-bold uppercase tracking-wide text-foreground/50",
  hourlyProb: "wx-prob-rod",
  hourlyMm: "text-[8px] font-semibold leading-tight text-foreground/50",
};

const rod: SiteConfig = {
  owner: "rod",
  appName: "rod's to-do(s)",
  title: "rod's to-do(s) ⚡",
  description: "A to-do list for Rod",
  loginHeading: "rod's hangout",
  loginDecor: "⚡",
  homeTagline: "rod's hangout",
  homeSubtitle: "one thing at a time. you got this, rod",
  homeAvatar: "emoji",
  homeAvatarEmoji: "⚡",
  navTodoEmoji: "⚡",
  notesTagline: "notes",
  ideasTagline: "let it spill out",
  notesSavedHint: "saved ⚡",
  emptyCompletedEmoji: "⚡",
  allDoneFooter: "All done — nailed it! ⚡",
  celebrationEmoji: "🏆",
  syncBlobName: "rod-sync.json",
  pushBlobName: "rod-push.json",
  themeColor: "#eef1f5",
  manifestBackground: "#6b8cae",
  weather: rodWeather,
};

export function getSiteOwner(): SiteOwner {
  return "rod";
}

export function getSiteConfig(): SiteConfig {
  return rod;
}

export function formatSiteDecor(text: string, decor: string) {
  return `${decor} ${text} ${decor}`;
}
