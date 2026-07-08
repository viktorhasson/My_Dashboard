"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, BarChart3, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickTaskDialog } from "@/components/quick-task-dialog";
import { SearchDialog } from "@/components/search-dialog";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 md:hidden dark:border-neutral-800 dark:bg-neutral-950">
      <span className="text-base font-semibold tracking-tight">My Dashboard</span>
      <div className="flex items-center gap-1">
        <SearchDialog
          trigger={
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          }
        />
        <QuickTaskDialog
          trigger={
            <Button variant="ghost" size="icon" aria-label="New task">
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-neutral-800 dark:bg-neutral-950">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
              active
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-500"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
