function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-900 ${className}`} />;
}

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Pulse className="h-8 w-32" />
      <Pulse className="h-[280px]" />
      <Pulse className="h-[280px]" />
      <Pulse className="h-[280px]" />
    </div>
  );
}
