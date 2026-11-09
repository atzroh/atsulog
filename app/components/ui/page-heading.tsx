import type { ReactNode } from "react";

export const PAGE_HEADING =
  "text-[1.625rem] font-normal uppercase tracking-wide";

/** The large heading pages open with; spacing comes from `className`. */
export function PageHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h1 className={`${PAGE_HEADING} ${className}`.trim()}>{children}</h1>;
}
