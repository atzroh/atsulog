"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { siteConfig } from "@/app/lib/site-config";

/** The header link a path belongs to: articles other than About fall under the list. */
function sectionOf(path: string): string | null {
  if (path === "/") return "/";
  if (path === `/articles/${siteConfig.aboutSlug}`) return path;
  if (path === "/articles" || path.startsWith("/articles/")) return "/articles";
  if (path === "/admin" || path.startsWith("/admin/")) return "/admin";
  return null;
}

/** A header link, grey until hovered like ArrowLink; its own page is dark and underlined. */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const current = sectionOf(usePathname()) === href;

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`underline-offset-[7px] hover:text-sky-600 hover:underline transition-colors ${current ? "text-foreground underline" : "text-muted"}`}
    >
      {children}
    </Link>
  );
}
