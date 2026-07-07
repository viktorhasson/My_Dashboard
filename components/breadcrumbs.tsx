import { Fragment } from "react";
import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="text-neutral-300 dark:text-neutral-700">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="underline-offset-4 hover:text-neutral-900 hover:underline dark:hover:text-white"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 dark:text-white">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
