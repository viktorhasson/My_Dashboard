"use client";

import { useMemo, useRef, useState, useTransition } from "react";
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
import { useToast } from "@/components/ui/toast";
import { createTask, updateTaskStatus } from "@/app/projects/[id]/tasks/actions";
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
      <QuickAddTask projectId={projectId} status={status} />
    </div>
  );
}

function QuickAddTask({ projectId, status }: { projectId: string; status: TaskStatus }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createTask(projectId, formData);
        formRef.current?.reset();
      } catch {
        toast("Failed to add task");
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-auto pt-1">
      <input type="hidden" name="status" value={status} />
      <input
        name="title"
        required
        disabled={pending}
        placeholder={pending ? "Adding..." : "+ Add task"}
        className="w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-400 focus:bg-white focus:outline-none disabled:opacity-50 dark:hover:border-neutral-700 dark:focus:border-neutral-600 dark:focus:bg-neutral-950"
      />
    </form>
  );
}

export function KanbanBoard({ projectId, initialTasks }: { projectId: string; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Server actions revalidate the page and stream down fresh props (e.g. a
  // task added via quick-add); sync them into the optimistic local state.
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  if (prevInitialTasks !== initialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }
  const [, startTransition] = useTransition();
  const toast = useToast();
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

    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTaskItem.id ? { ...t, status: overStatus } : t))
    );

    startTransition(async () => {
      try {
        await updateTaskStatus(activeTaskItem.id, projectId, overStatus);
      } catch {
        setTasks(previousTasks);
        toast("Failed to move task");
      }
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
