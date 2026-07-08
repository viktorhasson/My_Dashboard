import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TaskDetailsForm } from "@/components/task-detail/task-details-form";
import { StatusSelect } from "@/components/task-detail/status-select";
import { CommentSection } from "@/components/task-detail/comment-section";
import { TimeSection } from "@/components/task-detail/time-section";
import { AttachmentSection } from "@/components/task-detail/attachment-section";
import { ActivityFeed } from "@/components/activity-feed";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id: projectId, taskId } = await params;

  const [{ data: task }, { data: project }, { data: comments }, { data: timeEntries }, { data: attachments }, { data: activity }] =
    await Promise.all([
      supabaseServer.from("tasks").select("*").eq("id", taskId).single(),
      supabaseServer.from("projects").select("name").eq("id", projectId).single(),
      supabaseServer.from("comments").select("*").eq("task_id", taskId).order("created_at"),
      supabaseServer.from("time_entries").select("*").eq("task_id", taskId).order("logged_at", { ascending: false }),
      supabaseServer.from("attachments").select("*").eq("task_id", taskId).order("uploaded_at", { ascending: false }),
      supabaseServer
        .from("activity_log")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false }),
    ]);

  if (!task) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project?.name ?? "Project", href: `/projects/${projectId}` },
          { label: task.title },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <StatusSelect taskId={task.id} projectId={projectId} status={task.status} />
            <Badge variant={task.priority}>{task.priority}</Badge>
          </div>
          <TaskDetailsForm task={task} projectId={projectId} />
          <CommentSection taskId={task.id} projectId={projectId} comments={comments ?? []} />
          <TimeSection taskId={task.id} projectId={projectId} entries={timeEntries ?? []} />
          <AttachmentSection taskId={task.id} projectId={projectId} attachments={attachments ?? []} />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <h3 className="text-sm font-semibold">Activity</h3>
          <ActivityFeed entries={activity ?? []} />
        </div>
      </div>
    </div>
  );
}
