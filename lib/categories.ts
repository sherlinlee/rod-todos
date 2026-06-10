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
    pill: "bg-accent-soft/35 text-foreground ring-1 ring-accent-soft/40",
    boxActive: "border-accent bg-accent/8 ring-2 ring-accent/12",
    boxIdle: "border-accent-soft/60 bg-paper hover:border-accent/35",
    chipActive: "bg-accent/10 text-accent ring-1 ring-accent/20",
  },
  {
    id: "work",
    label: "Work",
    boxLabel: "Toolbox",
    emoji: "🔧",
    pill: "bg-mint/50 text-foreground ring-1 ring-forest/20",
    boxActive: "border-forest bg-mint/35 ring-2 ring-forest/15",
    boxIdle: "border-mint/80 bg-paper hover:border-forest/40",
    chipActive: "bg-mint/45 text-foreground ring-1 ring-forest/20",
  },
];

export function getCategoryMeta(id: Category) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
