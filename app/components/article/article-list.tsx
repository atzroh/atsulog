import Link from "next/link";
import type { ReactNode } from "react";
import type { ArticleMetadata, SortBy } from "@/app/lib/article/article-types";
import { ArticleTaxonomies } from "@/app/components/article/article-taxonomies";
import { formatDay } from "@/app/lib/date-format";

type ArticleListProps = {
  articles: ArticleMetadata[];
  basePath: string;
  /** Rows show the date the list is sorted on. */
  sortBy?: SortBy;
  /** Shown in place of the list when there are no articles. */
  empty?: ReactNode;
};

/** The articles as rows under rules, or `empty` when there are none. */
export function ArticleList({
  articles,
  basePath,
  sortBy = "created",
  empty = <p className="py-10 text-gray-700">No articles found</p>,
}: ArticleListProps) {
  if (articles.length === 0) return empty;

  return (
    <ol>
      {articles.map((article) => (
        <ArticleListItem
          key={article.slug}
          article={article}
          basePath={basePath}
          sortBy={sortBy}
        />
      ))}
    </ol>
  );
}

function ArticleListItem({
  article,
  basePath,
  sortBy,
}: {
  article: ArticleMetadata;
  basePath: string;
  sortBy: SortBy;
}) {
  const date = sortBy === "modified" ? article.modifiedAt : article.createdAt;

  return (
    <li className="flex flex-col gap-2 border-b border-gray-100 py-5 first:pt-0 last:border-b-0">
      <Link
        href={`${basePath}/${article.slug}`}
        className="group flex flex-col gap-1"
      >
        <h2 className="text-lg font-medium leading-snug group-hover:text-sky-600 transition-colors">
          {article.title}
        </h2>
        <time dateTime={date} className="text-sm text-muted tabular-nums">
          {sortBy === "modified" && "Updated "}
          {formatDay(date)}
        </time>
      </Link>

      {/* Kept outside the main link so each taxonomy link works on its own */}
      <ArticleTaxonomies article={article} basePath={basePath} />
    </li>
  );
}
