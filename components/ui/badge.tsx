import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
        low: "border border-neutral-200 text-neutral-400 dark:border-neutral-800 dark:text-neutral-500",
        medium: "border border-neutral-400 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300",
        high: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
        outline: "border border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
