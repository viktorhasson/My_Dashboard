"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

const ATTACHMENTS_BUCKET = "attachments";

export async function addComment(taskId: string, projectId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Comment body is required");

  const { error } = await supabaseServer.from("comments").insert({ task_id: taskId, body });
  if (error) throw new Error(error.message);

  await logActivity({ taskId, projectId, actionType: "comment_added", detail: { body } });

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
}

export async function logTime(taskId: string, projectId: string, formData: FormData) {
  const durationMinutes = Number(formData.get("duration_minutes"));
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!durationMinutes || durationMinutes <= 0) {
    throw new Error("Duration must be a positive number of minutes");
  }

  const { error } = await supabaseServer
    .from("time_entries")
    .insert({ task_id: taskId, duration_minutes: durationMinutes, note });
  if (error) throw new Error(error.message);

  await logActivity({
    taskId,
    projectId,
    actionType: "time_logged",
    detail: { duration_minutes: durationMinutes },
  });

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  revalidatePath("/reports");
}

export async function uploadAttachment(taskId: string, projectId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("A file is required");

  const storagePath = `${taskId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabaseServer.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(storagePath, file);
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabaseServer.from("attachments").insert({
    task_id: taskId,
    file_name: file.name,
    storage_path: storagePath,
    size: file.size,
  });
  if (error) throw new Error(error.message);

  await logActivity({
    taskId,
    projectId,
    actionType: "attachment_added",
    detail: { file_name: file.name },
  });

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
}

export async function getAttachmentUrl(storagePath: string) {
  const { data, error } = await supabaseServer.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 10);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function updateTaskDetails(taskId: string, projectId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const assignee = String(formData.get("assignee") ?? "").trim() || null;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const priority = String(formData.get("priority") ?? "medium");

  if (!title) throw new Error("Task title is required");

  const { error } = await supabaseServer
    .from("tasks")
    .update({
      title,
      description,
      assignee,
      due_date: dueDate,
      priority: priority as "low" | "medium" | "high",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  await logActivity({ taskId, projectId, actionType: "task_updated" });

  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  revalidatePath(`/projects/${projectId}`);
}
