"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "@/components/task-card";
import { updateTaskStatus } from "@/app/projects/[id]/tasks/actions";
import type { Task, TaskStatus } from "@/lib/supabase/types";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

function Column({
  status,
  label,
  tasks,
  projectId,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  projectId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] w-72 shrink-0 flex-col gap-2 rounded-lg border p-3 transition-colors ${
        isOver
          ? "border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900"
          : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-neutral-500">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} projectId={projectId} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ projectId, initialTasks }: { projectId: string; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of tasks) grouped[task.status].push(task);
    return grouped;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskItem = tasks.find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    const overStatus = COLUMNS.some((c) => c.id === over.id)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status;

    if (!overStatus || overStatus === activeTaskItem.status) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === activeTaskItem.id ? { ...t, status: overStatus } : t))
    );

    startTransition(() => {
      updateTaskStatus(activeTaskItem.id, projectId, overStatus);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column key={col.id} status={col.id} label={col.label} tasks={columns[col.id]} projectId={projectId} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} projectId={projectId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
