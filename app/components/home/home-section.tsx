import type { ReactNode } from "react";

/** A home page block under a small label, with an optional aside. */
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
      <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-2">
        <h2
          id={id}
          className="text-sm font-semibold uppercase tracking-wider text-muted"
        >
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
