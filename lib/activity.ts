import "server-only";
import { supabaseServer } from "./supabase/server";

export async function logActivity(entry: {
  taskId?: string | null;
  projectId?: string | null;
  actionType: string;
  detail?: Record<string, unknown>;
}) {
  const detail: Record<string, unknown> = { ...(entry.detail ?? {}) };

  // Snapshot display names into the detail payload so the activity feed can
  // render "moved <task> in <project>" with links, without joins at read time
  // and without losing the name if the task/project is later renamed.
  const [taskTitle, projectName] = await Promise.all([
    entry.taskId && detail.task_title === undefined
      ? supabaseServer.from("tasks").select("title").eq("id", entry.taskId).single()
      : null,
    entry.projectId && detail.project_name === undefined
      ? supabaseServer.from("projects").select("name").eq("id", entry.projectId).single()
      : null,
  ]);

  if (taskTitle?.data) detail.task_title = taskTitle.data.title;
  if (projectName?.data) detail.project_name = projectName.data.name;

  const { error } = await supabaseServer.from("activity_log").insert({
    task_id: entry.taskId ?? null,
    project_id: entry.projectId ?? null,
    action_type: entry.actionType,
    detail,
  });

  if (error) {
    throw new Error(`Failed to log activity: ${error.message}`);
  }
}
