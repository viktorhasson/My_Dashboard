"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
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
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleChange(next: TaskStatus) {
    const previous = value;
    setValue(next);
    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, projectId, next);
      } catch {
        setValue(previous);
        toast("Failed to update status");
      }
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(event) => handleChange(event.target.value as TaskStatus)}
      className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950"
    >
      <option value="todo">To Do</option>
      <option value="in_progress">In Progress</option>
      <option value="done">Done</option>
    </select>
  );
}
