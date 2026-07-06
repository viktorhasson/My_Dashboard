import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban-board";
import { NewTaskDialog } from "@/components/new-task-dialog";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: project }, { data: tasks, error: tasksError }] = await Promise.all([
    supabaseServer.from("projects").select("*").eq("id", id).single(),
    supabaseServer
      .from("tasks")
      .select("*")
      .eq("project_id", id)
      .order("position", { ascending: true }),
  ]);

  if (!project) notFound();
  if (tasksError) throw new Error(tasksError.message);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="text-2xl font-semibold">{project.name}</h1>
        </div>
        <NewTaskDialog projectId={project.id} />
      </div>
      {project.description && <p className="text-sm text-neutral-500">{project.description}</p>}

      <KanbanBoard projectId={project.id} initialTasks={tasks ?? []} />
    </div>
  );
}
