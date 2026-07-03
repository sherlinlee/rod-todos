export type Category = "personal" | "work";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt?: number;
  dueDate: string | null;
  /** "HH:MM" in 5-minute steps; only used when dueDate is set */
  reminderTime?: string | null;
  /** YYYY-MM-DD when a per-task reminder last fired */
  lastRemindedDate?: string | null;
  category: Category;
  order: number;
  permanent?: boolean;
  lastCompletedDate?: string | null;
};

export type StatusFilter = "all" | "active" | "completed";
export type CategoryFilter = "all" | Category;
