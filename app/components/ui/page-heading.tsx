import type { ReactNode } from "react";

/** The large heading pages open with; spacing comes from `className`. */
export function PageHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`text-[1.625rem] font-normal uppercase tracking-wide ${className}`.trim()}
    >
      {children}
    </h1>
  );
}
