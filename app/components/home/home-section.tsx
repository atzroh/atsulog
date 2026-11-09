import type { ReactNode } from "react";

/** A home page block under a light uppercase heading like PageHeading, with an optional aside. */
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
        <h2
          id={id}
          className="text-[1.625rem] font-normal uppercase tracking-wide"
        >
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
