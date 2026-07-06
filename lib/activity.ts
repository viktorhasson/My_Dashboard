import "server-only";
import { supabaseServer } from "./supabase/server";

export async function logActivity(entry: {
  taskId?: string | null;
  projectId?: string | null;
  actionType: string;
  detail?: Record<string, unknown>;
}) {
  const { error } = await supabaseServer.from("activity_log").insert({
    task_id: entry.taskId ?? null,
    project_id: entry.projectId ?? null,
    action_type: entry.actionType,
    detail: entry.detail ?? {},
  });

  if (error) {
    throw new Error(`Failed to log activity: ${error.message}`);
  }
}
