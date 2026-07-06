"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/supabase/types";

export function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/projects/${projectId}/tasks/${task.id}`}>
        <Card
          className={cn(
            "cursor-grab p-3 hover:border-neutral-400 active:cursor-grabbing dark:hover:border-neutral-500",
            isDragging && "opacity-50"
          )}
        >
          <p className="text-sm font-medium">{task.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={task.priority}>{task.priority}</Badge>
            {task.assignee && (
              <span className="text-xs text-neutral-500">{task.assignee}</span>
            )}
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <CalendarDays className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </Card>
      </Link>
    </div>
  );
}
