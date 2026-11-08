import type { ReactNode } from "react";

/** The large heading pages open with, light like the home hero; spacing comes from `className`. */
export function PageHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`text-4xl font-light uppercase tracking-wide ${className}`.trim()}
    >
      {children}
    </h1>
  );
}
