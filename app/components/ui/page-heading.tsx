import type { ReactNode } from "react";

/** The large heading pages and sections open with; spacing comes from `className`. */
export function PageHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1 className={`text-3xl font-bold tracking-tight ${className}`.trim()}>
      {children}
    </h1>
  );
}
