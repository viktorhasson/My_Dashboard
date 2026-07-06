"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const color = String(formData.get("color") ?? "#6366f1");

  if (!name) throw new Error("Project name is required");

  const { data, error } = await supabaseServer
    .from("projects")
    .insert({ name, description, color })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    projectId: data.id,
    actionType: "project_created",
    detail: { name },
  });

  revalidatePath("/projects");
  revalidatePath("/");
}

export async function setProjectStatus(projectId: string, status: "active" | "archived") {
  const { error } = await supabaseServer
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  await logActivity({
    projectId,
    actionType: status === "archived" ? "project_archived" : "project_restored",
  });

  revalidatePath("/projects");
  revalidatePath("/");
}
