function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Pulse className="h-8 w-40" />
        <Pulse className="h-5 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Pulse className="h-24" />
        <Pulse className="h-24" />
        <Pulse className="h-24" />
      </div>
      <Pulse className="h-64" />
    </div>
  );
}
