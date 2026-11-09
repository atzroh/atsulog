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

/**
 * A header link, grey until hovered like ArrowLink; its own page is dark, its
 * label underlined. Phones show the icon alone, the label kept for screen
 * readers. The icon is an element: a component can't cross from the server.
 */
export function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const current = sectionOf(usePathname()) === href;

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`group flex items-center hover:text-sky-600 transition-colors [&>svg]:size-[18px] sm:[&>svg]:hidden ${current ? "text-foreground" : "text-muted"}`}
    >
      {icon}
      <span
        className={`sr-only underline-offset-[7px] group-hover:underline sm:not-sr-only ${current ? "underline" : ""}`}
      >
        {children}
      </span>
    </Link>
  );
}
