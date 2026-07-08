"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS_STYLE = { fontSize: 12 };
// Charts inherit `currentColor` from this class so they stay monochrome in
// both themes: near-black on white, near-white on black.
const CHART_CLASS = "text-neutral-900 dark:text-neutral-100";

export function TimePerProjectChart({ data }: { data: { name: string; hours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280} className={CHART_CLASS}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="name" tick={AXIS_STYLE} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip />
        <Bar dataKey="hours" fill="currentColor" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TasksCompletedChart({ data }: { data: { week: string; completed: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280} className={CHART_CLASS}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="week" tick={AXIS_STYLE} />
        <YAxis allowDecimals={false} tick={AXIS_STYLE} />
        <Tooltip />
        <Line type="monotone" dataKey="completed" stroke="currentColor" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WorkloadChart({ data }: { data: { name: string; tasks: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280} className={CHART_CLASS}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis type="number" allowDecimals={false} tick={AXIS_STYLE} />
        <YAxis dataKey="name" type="category" width={100} tick={AXIS_STYLE} />
        <Tooltip />
        <Bar dataKey="tasks" fill="currentColor" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
