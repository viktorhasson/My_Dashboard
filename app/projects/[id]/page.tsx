import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
      <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: project.name }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        <NewTaskDialog projectId={project.id} />
      </div>
      {project.description && <p className="text-sm text-neutral-500">{project.description}</p>}

      <KanbanBoard projectId={project.id} initialTasks={tasks ?? []} />
    </div>
  );
}
