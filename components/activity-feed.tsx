import Link from "next/link";
import type { ActivityLogEntry } from "@/lib/supabase/types";

const ACTION_LABELS: Record<string, string> = {
  project_created: "created the project",
  project_archived: "archived the project",
  project_restored: "restored the project",
  task_created: "created a task",
  task_status_changed: "moved a task",
  task_updated: "updated a task",
  comment_added: "commented",
  time_logged: "logged time",
  attachment_added: "attached a file",
};

function detailString(detail: Record<string, unknown>, key: string): string | null {
  const value = detail?.[key];
  return typeof value === "string" && value ? value : null;
}

function entryTarget(entry: ActivityLogEntry): { label: string; href: string } | null {
  const taskTitle = detailString(entry.detail, "task_title");
  const projectName = detailString(entry.detail, "project_name");

  if (entry.task_id && entry.project_id && taskTitle) {
    return { label: taskTitle, href: `/projects/${entry.project_id}/tasks/${entry.task_id}` };
  }
  if (entry.project_id && projectName) {
    return { label: projectName, href: `/projects/${entry.project_id}` };
  }
  return null;
}

export function ActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-neutral-500">No activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const target = entryTarget(entry);
        const projectName = detailString(entry.detail, "project_name");
        return (
          <div key={entry.id} className="flex items-start justify-between gap-4 text-sm">
            <span className="min-w-0">
              {ACTION_LABELS[entry.action_type] ?? entry.action_type}
              {target && (
                <>
                  {" · "}
                  <Link
                    href={target.href}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {target.label}
                  </Link>
                </>
              )}
              {target && entry.task_id && projectName && (
                <span className="text-neutral-500"> in {projectName}</span>
              )}
            </span>
            <span className="whitespace-nowrap text-xs text-neutral-500">
              {new Date(entry.created_at).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
