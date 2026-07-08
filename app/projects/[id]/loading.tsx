function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900 ${className}`} />;
}

export default function ProjectLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Pulse className="h-5 w-48" />
      <div className="flex items-center justify-between">
        <Pulse className="h-8 w-56" />
        <Pulse className="h-9 w-28" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        <Pulse className="h-64 w-72 shrink-0" />
        <Pulse className="h-64 w-72 shrink-0" />
        <Pulse className="h-64 w-72 shrink-0" />
      </div>
    </div>
  );
}
