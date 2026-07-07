import { supabaseServer } from "@/lib/supabase/server";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [{ data: projects, error }, { data: tasks }] = await Promise.all([
    supabaseServer.from("projects").select("*").order("created_at", { ascending: false }),
    supabaseServer.from("tasks").select("*").neq("status", "done"),
  ]);

  if (error) throw new Error(error.message);

  const openCounts = new Map<string, number>();
  for (const task of tasks ?? []) {
    openCounts.set(task.project_id, (openCounts.get(task.project_id) ?? 0) + 1);
  }

  const active = (projects ?? []).filter((p) => p.status === "active");
  const archived = (projects ?? []).filter((p) => p.status === "archived");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <NewProjectDialog />
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 py-16 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">No projects yet.</p>
          <NewProjectDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((project) => (
            <ProjectCard key={project.id} project={project} openCount={openCounts.get(project.id) ?? 0} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-neutral-500">Archived</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((project) => (
              <ProjectCard key={project.id} project={project} openCount={openCounts.get(project.id) ?? 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
