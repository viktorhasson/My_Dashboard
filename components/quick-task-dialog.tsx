"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getActiveProjects } from "@/app/projects/actions";
import { createTask } from "@/app/projects/[id]/tasks/actions";

export function QuickTaskDialog() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[] | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) getActiveProjects().then(setProjects);
  }, [open]);

  function handleSubmit(formData: FormData) {
    const projectId = String(formData.get("project_id") ?? "");
    if (!projectId) return;
    startTransition(async () => {
      await createTask(projectId, formData);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-6 w-full">
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>
        {projects === null ? (
          <p className="text-sm text-neutral-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No active projects yet —{" "}
            <Link
              href="/projects"
              className="text-neutral-900 underline underline-offset-4 dark:text-white"
              onClick={() => setOpen(false)}
            >
              create a project
            </Link>{" "}
            first.
          </p>
        ) : (
          <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
            <select
              name="project_id"
              required
              defaultValue={projects[0].id}
              className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <Input name="title" placeholder="Task title" required />
            <div className="flex gap-2">
              <select
                name="priority"
                defaultValue="medium"
                className="h-9 flex-1 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Input name="due_date" type="date" className="flex-1" />
            </div>
            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Adding..." : "Add task"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
