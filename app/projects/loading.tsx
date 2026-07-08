function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900 ${className}`} />;
}

export default function ProjectsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Pulse className="h-8 w-32" />
        <Pulse className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Pulse className="h-32" />
        <Pulse className="h-32" />
        <Pulse className="h-32" />
      </div>
    </div>
  );
}
