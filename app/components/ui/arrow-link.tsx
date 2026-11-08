import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** A small link onward, such as "All articles"; grey until hovered, when it turns sky and the arrow nudges. */
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group/arrow inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted hover:text-sky-600 hover:underline underline-offset-2 transition-colors"
    >
      {children}
      <ArrowRight
        className="size-3.5 transition-transform group-hover/arrow:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
