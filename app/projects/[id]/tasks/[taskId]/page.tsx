import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { TaskDetailsForm } from "@/components/task-detail/task-details-form";
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

  const [{ data: task }, { data: comments }, { data: timeEntries }, { data: attachments }, { data: activity }] =
    await Promise.all([
      supabaseServer.from("tasks").select("*").eq("id", taskId).single(),
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
      <Link
        href={`/projects/${projectId}`}
        className="flex w-fit items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to board
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Badge variant={task.priority}>{task.priority}</Badge>
            <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
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
