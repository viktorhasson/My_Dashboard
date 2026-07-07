"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getSearchIndex } from "@/app/actions";

type SearchIndex = Awaited<ReturnType<typeof getSearchIndex>>;

export function SearchDialog({
  trigger,
  enableHotkey = false,
}: {
  trigger?: React.ReactNode;
  enableHotkey?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const router = useRouter();

  const openDialog = useCallback(() => {
    setQuery("");
    setOpen(true);
    getSearchIndex().then(setIndex);
  }, []);

  useEffect(() => {
    if (!enableHotkey) return;
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else openDialog();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableHotkey, open, openDialog]);

  const projectNameById = useMemo(
    () => new Map((index?.projects ?? []).map((project) => [project.id, project.name])),
    [index]
  );

  const results = useMemo(() => {
    if (!index) return { projects: [], tasks: [] };
    const q = query.trim().toLowerCase();
    const projects = q
      ? index.projects.filter((project) => project.name.toLowerCase().includes(q))
      : index.projects;
    const tasks = q
      ? index.tasks.filter((task) => task.title.toLowerCase().includes(q))
      : index.tasks;
    return { projects: projects.slice(0, 5), tasks: tasks.slice(0, 8) };
  }, [index, query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? openDialog() : setOpen(false))}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Search className="h-4 w-4" />
            Search
            <kbd className="ml-auto text-[10px] font-normal text-neutral-400">⌘K</kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="top-24 translate-y-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects and tasks..."
        />
        <div className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto">
          {index === null ? (
            <p className="text-sm text-neutral-500">Loading...</p>
          ) : results.projects.length === 0 && results.tasks.length === 0 ? (
            <p className="text-sm text-neutral-500">No results.</p>
          ) : (
            <>
              {results.projects.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                    Projects
                  </p>
                  {results.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => go(`/projects/${project.id}`)}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <span>{project.name}</span>
                      {project.status === "archived" && (
                        <span className="text-xs text-neutral-400">archived</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {results.tasks.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                    Tasks
                  </p>
                  {results.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => go(`/projects/${task.project_id}/tasks/${task.id}`)}
                      className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <span className={task.status === "done" ? "text-neutral-400 line-through" : ""}>
                        {task.title}
                      </span>
                      <span className="shrink-0 text-xs text-neutral-400">
                        {projectNameById.get(task.project_id)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
