"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import type { TaskStatus } from "@/lib/supabase/types";

const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export async function createTask(projectId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "medium");
  const assignee = String(formData.get("assignee") ?? "").trim() || null;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const statusRaw = String(formData.get("status") ?? "todo");
  const status = TASK_STATUSES.includes(statusRaw as TaskStatus)
    ? (statusRaw as TaskStatus)
    : "todo";

  if (!title) throw new Error("Task title is required");

  const { count } = await supabaseServer
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("status", status);

  const { data, error } = await supabaseServer
    .from("tasks")
    .insert({
      project_id: projectId,
      title,
      description,
      status,
      priority: priority as "low" | "medium" | "high",
      assignee,
      due_date: dueDate,
      position: count ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    taskId: data.id,
    projectId,
    actionType: "task_created",
    detail: { title },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus) {
  const { error } = await supabaseServer.from("tasks").update({ status }).eq("id", taskId);

  if (error) throw new Error(error.message);

  await logActivity({
    taskId,
    projectId,
    actionType: "task_status_changed",
    detail: { status },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  revalidatePath("/");
  revalidatePath("/reports");
}
