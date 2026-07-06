"use client";

import { useTransition } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateTaskDetails } from "@/app/projects/[id]/tasks/[taskId]/actions";
import type { Task } from "@/lib/supabase/types";

export function TaskDetailsForm({ task, projectId }: { task: Task; projectId: string }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(() => updateTaskDetails(task.id, projectId, formData));
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <Input name="title" defaultValue={task.title} required />
      <Textarea name="description" defaultValue={task.description ?? ""} rows={4} placeholder="Description" />
      <div className="flex gap-2">
        <select
          name="priority"
          defaultValue={task.priority}
          className="h-9 flex-1 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <Input name="due_date" type="date" defaultValue={task.due_date ?? ""} className="flex-1" />
      </div>
      <Input name="assignee" defaultValue={task.assignee ?? ""} placeholder="Assignee" />
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
