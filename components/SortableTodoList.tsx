"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TodoItem, { type TodoUpdates } from "@/components/TodoItem";
import type { Todo } from "@/lib/types";

type SortableTodoListProps = {
  todos: Todo[];
  completingId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: TodoUpdates) => void;
  onReorder: (activeId: string, overId: string) => void;
};

export default function SortableTodoList({
  todos,
  completingId,
  onToggle,
  onDelete,
  onUpdate,
  onReorder,
}: SortableTodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-1.5">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isCompleting={completingId === todo.id}
              isChecking={completingId === todo.id && !todo.completed}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
