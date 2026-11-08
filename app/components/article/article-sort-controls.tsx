"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpNarrowWide,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import type {
  ArticleSearchParams,
  SortBy,
  SortOrder,
} from "@/app/lib/article/article-types";
import {
  buildArticleSearchUrl,
  getSortConfig,
} from "@/app/lib/article/article-utils";

type ArticleSortControlsProps = {
  searchParams: ArticleSearchParams;
  basePath: string;
};

type SortOption = {
  label: string;
  description: string;
  icon: LucideIcon;
  sortBy: SortBy;
  order: SortOrder;
};

/** The three orders that make sense; Modified is newest-first only. */
const SORT_OPTIONS: SortOption[] = [
  {
    label: "Newest",
    description: "Most recently published",
    icon: ArrowDownWideNarrow,
    sortBy: "created",
    order: "desc",
  },
  {
    label: "Oldest",
    description: "Oldest first",
    icon: ArrowUpNarrowWide,
    sortBy: "created",
    order: "asc",
  },
  {
    label: "Updated",
    description: "Most recently updated",
    icon: Pencil,
    sortBy: "modified",
    order: "desc",
  },
];

/**
 * A quiet "Newest" trigger opening a described list of orders.
 * Closes on outside click, Esc, or choosing an order.
 */
export function ArticleSortControls({
  searchParams,
  basePath,
}: ArticleSortControlsProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { sortBy, order } = getSortConfig(searchParams);
  const current =
    SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.order === order) ??
    SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowUpDown className="size-3.5" aria-hidden="true" />
        {current.label}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Sort articles"
          className="absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {SORT_OPTIONS.map((option) => {
            const active = option === current;
            const Icon = option.icon;
            return (
              <Link
                key={option.label}
                href={buildArticleSearchUrl(basePath, searchParams, {
                  sortBy: option.sortBy,
                  order: option.order,
                  page: null,
                })}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => setOpen(false)}
                className={`flex items-start gap-3 rounded-md px-2.5 py-2 transition-colors ${active ? "bg-gray-50" : "hover:bg-gray-50"}`}
              >
                <Icon
                  className={`mt-0.5 size-4 ${active ? "text-foreground" : "text-gray-400"}`}
                  aria-hidden="true"
                />
                <span className="flex flex-col">
                  <span
                    className={`text-sm ${active ? "font-medium text-foreground" : "text-gray-700"}`}
                  >
                    {option.label}
                  </span>
                  <span className="text-xs text-muted">
                    {option.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
