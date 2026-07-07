import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/activity-feed";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const weekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: projects }, { data: openTasks }, { data: weekTime }, { data: activity }] =
    await Promise.all([
      supabaseServer.from("projects").select("*").eq("status", "active"),
      supabaseServer.from("tasks").select("*").neq("status", "done"),
      supabaseServer.from("time_entries").select("*").gte("logged_at", weekAgo),
      supabaseServer
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

  const weekMinutes = (weekTime ?? []).reduce((sum, e) => sum + e.duration_minutes, 0);

  const stats = [
    { label: "Active projects", value: projects?.length ?? 0, href: "/projects" },
    { label: "Open tasks", value: openTasks?.length ?? 0, href: "/projects" },
    { label: "Hours logged this week", value: (weekMinutes / 60).toFixed(1), href: "/reports" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/projects"
          className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-white"
        >
          View projects &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full transition-colors hover:border-neutral-400 dark:hover:border-neutral-600">
              <CardHeader>
                <CardTitle className="text-neutral-500">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stat.value}</CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed entries={activity ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
