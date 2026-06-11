"use client";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(_event: DragStartEvent) {
    document.body.classList.add("is-dragging");
  }

  function handleDragEnd(event: DragEndEvent) {
    document.body.classList.remove("is-dragging");
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  }

  function handleDragCancel() {
    document.body.classList.remove("is-dragging");
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="sortable-list space-y-1.5">
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
