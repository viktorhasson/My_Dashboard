"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "@/app/projects/[id]/tasks/actions";
import type { TaskStatus } from "@/lib/supabase/types";

export function StatusSelect({
  taskId,
  projectId,
  status,
}: {
  taskId: string;
  projectId: string;
  status: TaskStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(event) =>
        startTransition(() =>
          updateTaskStatus(taskId, projectId, event.target.value as TaskStatus)
        )
      }
      className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950"
    >
      <option value="todo">To Do</option>
      <option value="in_progress">In Progress</option>
      <option value="done">Done</option>
    </select>
  );
}
