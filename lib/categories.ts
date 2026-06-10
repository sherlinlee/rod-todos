import type { Category } from "./types";

export const CATEGORIES: {
  id: Category;
  label: string;
  boxLabel: string;
  emoji: string;
  pill: string;
  boxActive: string;
  boxIdle: string;
  chipActive: string;
}[] = [
  {
    id: "personal",
    label: "Personal",
    boxLabel: "Chill box",
    emoji: "🏠",
    pill: "bg-accent-soft/40 text-foreground ring-1 ring-accent-soft/30",
    boxActive: "border-accent bg-accent-soft/35 ring-2 ring-accent/15",
    boxIdle: "border-accent-soft/70 bg-paper hover:border-accent/50",
    chipActive: "bg-accent-soft/60 text-foreground ring-1 ring-accent/25",
  },
  {
    id: "work",
    label: "Work",
    boxLabel: "Toolbox",
    emoji: "🔧",
    pill: "bg-mint/60 text-foreground",
    boxActive: "border-forest bg-mint/40 ring-2 ring-forest/20",
    boxIdle: "border-mint bg-paper hover:border-forest/50",
    chipActive: "bg-mint/55 text-foreground ring-1 ring-forest/20",
  },
];

export function getCategoryMeta(id: Category) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
