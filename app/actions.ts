"use server";

import { supabaseServer } from "@/lib/supabase/server";

// Read-only index for the global search dialog (single-user app, small data:
// fetching everything and filtering client-side keeps search instant).
export async function getSearchIndex() {
  const [{ data: projects, error: projectsError }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabaseServer
        .from("projects")
        .select("id, name, status")
        .order("created_at", { ascending: false }),
      supabaseServer
        .from("tasks")
        .select("id, title, project_id, status")
        .order("created_at", { ascending: false }),
    ]);

  if (projectsError) throw new Error(projectsError.message);
  if (tasksError) throw new Error(tasksError.message);

  return { projects: projects ?? [], tasks: tasks ?? [] };
}
