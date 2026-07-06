"use client";

import { useRef, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { logTime } from "@/app/projects/[id]/tasks/[taskId]/actions";
import type { TimeEntry } from "@/lib/supabase/types";

export function TimeSection({
  taskId,
  projectId,
  entries,
}: {
  taskId: string;
  projectId: string;
  entries: TimeEntry[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await logTime(taskId, projectId, formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold">
        Time tracked <span className="font-normal text-neutral-500">({(totalMinutes / 60).toFixed(1)}h)</span>
      </h3>
      <div className="flex flex-col gap-2">
        {entries.length === 0 && <p className="text-xs text-neutral-500">No time logged yet.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-2 text-sm dark:border-neutral-800">
            <span>{entry.duration_minutes} min{entry.note ? ` — ${entry.note}` : ""}</span>
            <span className="text-xs text-neutral-500">{new Date(entry.logged_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <Input name="duration_minutes" type="number" min={1} placeholder="Minutes" required className="w-28" />
        <Input name="note" placeholder="Note (optional)" className="flex-1" />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Logging..." : "Log time"}
        </Button>
      </form>
    </div>
  );
}
