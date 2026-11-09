import type { ReactNode } from "react";
import { PAGE_HEADING } from "@/app/components/ui/page-heading";

/** A home page block under a PageHeading-style heading, with an optional aside. */
export function HomeSection({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const id = `home-${title.toLowerCase()}`;

  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={id} className={PAGE_HEADING}>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
