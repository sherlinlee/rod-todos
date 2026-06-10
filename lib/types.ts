export type Category = "personal" | "work";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate: string | null;
  category: Category;
  order: number;
  permanent?: boolean;
  lastCompletedDate?: string | null;
};

export type StatusFilter = "all" | "active" | "completed";
export type CategoryFilter = "all" | Category;
