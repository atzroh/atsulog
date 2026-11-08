import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Calendar,
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
    next: "created",
    styles:
      "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
};

const TOGGLE_STYLES =
  "flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border";

/**
 * A button toggling Created <-> Modified, plus an order toggle shown only for
 * Created (Modified is newest-first only).
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
    <div className="flex items-center space-x-2">
      <Link
        href={buildArticleSearchUrl(basePath, searchParams, {
          sortBy: current.next,
          // Modified only makes sense newest-first.
          ...(current.next === "created" ? {} : { order: "desc" }),
        })}
        className={`${TOGGLE_STYLES} ${current.styles}`}
        title={`Sort by ${SORT_KEYS[current.next].label}`}
      >
        <Icon className="size-3.5" />
        <span>{current.label}</span>
      </Link>

      {sortBy === "created" && (
        <Link
          href={buildArticleSearchUrl(basePath, searchParams, {
            order: isAsc ? "desc" : "asc",
          })}
          className={`${TOGGLE_STYLES} text-muted hover:text-foreground hover:bg-gray-50 border-gray-200 hover:border-gray-300`}
          title={isAsc ? "Sort Descending" : "Sort Ascending"}
        >
          <OrderIcon className="size-3.5" />
          <span>{isAsc ? "Asc" : "Desc"}</span>
        </Link>
      )}
    </div>
  );
}
