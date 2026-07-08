function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900 ${className}`} />;
}

export default function TaskDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Pulse className="h-5 w-64" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Pulse className="h-8 w-40" />
          <Pulse className="h-40" />
          <Pulse className="h-32" />
          <Pulse className="h-32" />
        </div>
        <Pulse className="h-64" />
      </div>
    </div>
  );
}
