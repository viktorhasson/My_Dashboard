"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setProjectStatus } from "@/app/projects/actions";
import type { Project } from "@/lib/supabase/types";

export function ProjectCard({
  project,
  openCount,
}: {
  project: Project;
  openCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const archived = project.status === "archived";

  function changeStatus(status: "active" | "archived", { undoable }: { undoable: boolean }) {
    startTransition(async () => {
      try {
        await setProjectStatus(project.id, status);
        toast(
          status === "archived" ? "Project archived" : "Project restored",
          undoable
            ? {
                label: "Undo",
                onClick: () =>
                  changeStatus(status === "archived" ? "active" : "archived", {
                    undoable: false,
                  }),
              }
            : undefined
        );
      } catch {
        toast("Failed to update project");
      }
    });
  }

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <CardTitle>{project.name}</CardTitle>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{project.description}</p>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={() => changeStatus(archived ? "active" : "archived", { undoable: true })}
          title={archived ? "Restore project" : "Archive project"}
        >
          {archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <span className="text-xs text-neutral-500">{openCount} open task{openCount === 1 ? "" : "s"}</span>
      </CardContent>
    </Card>
  );
}
