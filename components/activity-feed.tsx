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

export function ActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-xs text-neutral-500">No activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start justify-between text-sm">
          <span>{ACTION_LABELS[entry.action_type] ?? entry.action_type}</span>
          <span className="whitespace-nowrap text-xs text-neutral-500">
            {new Date(entry.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
