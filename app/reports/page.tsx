import nextDynamic from "next/dynamic";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const ChartSkeleton = () => <div className="h-[280px] animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900" />;

const TimePerProjectChart = nextDynamic(
  () => import("@/components/reports/reports-charts").then((m) => m.TimePerProjectChart),
  { loading: ChartSkeleton }
);
const TasksCompletedChart = nextDynamic(
  () => import("@/components/reports/reports-charts").then((m) => m.TasksCompletedChart),
  { loading: ChartSkeleton }
);
const WorkloadChart = nextDynamic(
  () => import("@/components/reports/reports-charts").then((m) => m.WorkloadChart),
  { loading: ChartSkeleton }
);

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function ReportsPage() {
  const [{ data: projects }, { data: tasks }, { data: timeEntries }] = await Promise.all([
    supabaseServer.from("projects").select("id, name"),
    supabaseServer.from("tasks").select("id, project_id, status, assignee, updated_at"),
    supabaseServer.from("time_entries").select("task_id, duration_minutes"),
  ]);

  const projectNameById = new Map((projects ?? []).map((p) => [p.id, p.name]));
  const projectIdByTaskId = new Map((tasks ?? []).map((t) => [t.id, t.project_id]));

  const minutesByProject = new Map<string, number>();
  for (const entry of timeEntries ?? []) {
    const projectId = projectIdByTaskId.get(entry.task_id);
    if (!projectId) continue;
    minutesByProject.set(projectId, (minutesByProject.get(projectId) ?? 0) + entry.duration_minutes);
  }
  const timePerProject = Array.from(minutesByProject.entries()).map(([projectId, minutes]) => ({
    name: projectNameById.get(projectId) ?? "Unknown",
    hours: Number((minutes / 60).toFixed(1)),
  }));

  const now = new Date();
  const weeks: { label: string; start: Date; end: Date }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, start, end });
  }
  const tasksCompleted = weeks.map(({ label, start, end }) => ({
    week: label,
    completed: (tasks ?? []).filter(
      (t) => t.status === "done" && new Date(t.updated_at) >= start && new Date(t.updated_at) < end
    ).length,
  }));

  const workloadByAssignee = new Map<string, number>();
  for (const task of tasks ?? []) {
    if (task.status === "done") continue;
    const assignee = task.assignee?.trim() || "Unassigned";
    workloadByAssignee.set(assignee, (workloadByAssignee.get(assignee) ?? 0) + 1);
  }
  const workload = Array.from(workloadByAssignee.entries()).map(([name, tasks]) => ({ name, tasks }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle>Time tracked per project (hours)</CardTitle>
        </CardHeader>
        <CardContent>
          {timePerProject.length === 0 ? (
            <p className="text-sm text-neutral-500">No time logged yet.</p>
          ) : (
            <TimePerProjectChart data={timePerProject} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks completed per week</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksCompletedChart data={tasksCompleted} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open task workload by assignee</CardTitle>
        </CardHeader>
        <CardContent>
          {workload.length === 0 ? (
            <p className="text-sm text-neutral-500">No open tasks.</p>
          ) : (
            <WorkloadChart data={workload} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
