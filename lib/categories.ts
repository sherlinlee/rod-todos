import type { Category } from "./types";

export type CategoryMeta = {
  id: Category;
  label: string;
  boxLabel: string;
  emoji: string;
  pill: string;
  boxActive: string;
  boxIdle: string;
};

const categories: CategoryMeta[] = [
  {
    id: "personal",
    label: "Personal",
    boxLabel: "Chill box",
    emoji: "☁️",
    pill: "bg-accent-soft/50 text-foreground",
    boxActive: "border-accent bg-accent-soft/35 ring-4 ring-accent/15",
    boxIdle: "border-accent-soft/70 bg-paper hover:border-accent/50",
  },
  {
    id: "work",
    label: "Work",
    boxLabel: "Toolbox",
    emoji: "🔨",
    pill: "bg-mint/60 text-foreground",
    boxActive: "border-forest bg-mint/40 ring-4 ring-forest/20",
    boxIdle: "border-mint bg-paper hover:border-forest/50",
  },
];

export function getCategories(): CategoryMeta[] {
  return categories;
}

/** @deprecated use getCategories() */
export const CATEGORIES = categories;

export function getCategoryMeta(id: Category): CategoryMeta {
  return getCategories().find((c) => c.id === id) ?? getCategories()[0];
}
