import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** The row of links that closes a page, under a rule. */
export function PageNav({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <nav
      aria-label={label}
      className="flex items-center justify-between border-t border-gray-100 pt-10"
    >
      {children}
    </nav>
  );
}

/** A link in a PageNav, grey until hovered like ArrowLink; links on the right take `iconAfter`. */
export function PageNavLink({
  href,
  icon: Icon,
  iconAfter = false,
  children,
}: {
  href: string;
  icon: LucideIcon;
  iconAfter?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-sm font-medium text-muted hover:text-sky-600 hover:underline underline-offset-2 transition-colors"
    >
      {!iconAfter && <Icon className="size-4" aria-hidden="true" />}
      {children}
      {iconAfter && <Icon className="size-4" aria-hidden="true" />}
    </Link>
  );
}
