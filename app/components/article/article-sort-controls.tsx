import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Calendar,
  Eye,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import type {
  ArticleSearchParams,
  SortBy,
} from "@/app/lib/article/article-types";
import {
  buildArticleSearchUrl,
  getSortConfig,
} from "@/app/lib/article/article-utils";

type ArticleSortControlsProps = {
  searchParams: ArticleSearchParams;
  basePath: string;
};

/** How each sort key presents itself, and which key the button cycles to next. */
const SORT_KEYS: Record<
  SortBy,
  { icon: LucideIcon; label: string; next: SortBy; styles: string }
> = {
  created: {
    icon: Calendar,
    label: "Created",
    next: "modified",
    styles: "bg-sky-50 border-sky-100 text-sky-700 hover:bg-sky-100",
  },
  modified: {
    icon: RotateCcw,
    label: "Modified",
    next: "views",
    styles:
      "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  views: {
    icon: Eye,
    label: "Views",
    next: "created",
    styles: "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100",
  },
};

const TOGGLE_STYLES =
  "flex items-center space-x-[0.5rem] px-[0.75rem] py-[0.375rem] text-sm font-medium rounded-lg transition-all border";

/**
 * A button cycling Created -> Modified -> Views, plus an order toggle shown
 * only for Created (the other two are newest-first only).
 */
export function ArticleSortControls({
  searchParams,
  basePath,
}: ArticleSortControlsProps) {
  const { sortBy, order } = getSortConfig(searchParams);
  const current = SORT_KEYS[sortBy];
  const isAsc = order === "asc";

  const Icon = current.icon;
  const OrderIcon = isAsc ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <div className="flex items-center space-x-[0.5rem]">
      <Link
        href={buildArticleSearchUrl(basePath, searchParams, {
          sortBy: current.next,
          // Modified and Views only make sense newest-first.
          ...(current.next === "created" ? {} : { order: "desc" }),
        })}
        className={`${TOGGLE_STYLES} ${current.styles}`}
        title={`Sort by ${SORT_KEYS[current.next].label}`}
      >
        <Icon className="size-[0.875rem]" />
        <span>{current.label}</span>
      </Link>

      {sortBy === "created" && (
        <Link
          href={buildArticleSearchUrl(basePath, searchParams, {
            order: isAsc ? "desc" : "asc",
          })}
          className="flex items-center space-x-[0.5rem] px-[0.75rem] py-[0.375rem] text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-lg transition-all"
          title={isAsc ? "Sort Descending" : "Sort Ascending"}
        >
          <OrderIcon className="size-[0.875rem]" />
          <span>{isAsc ? "Asc" : "Desc"}</span>
        </Link>
      )}
    </div>
  );
}
