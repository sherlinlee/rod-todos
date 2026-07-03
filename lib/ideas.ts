export type Idea = {
  id: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
};

const STORAGE_KEY = "to-dos-ideas";

export function loadIdeas(): Idea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Idea[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => typeof i.id === "string" && typeof i.text === "string",
    );
  } catch {
    return [];
  }
}

export function saveIdeas(ideas: Idea[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}
