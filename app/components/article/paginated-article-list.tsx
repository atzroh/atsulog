import Link from "next/link";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { ArticleList } from "@/app/components/article/article-list";
import { ArticleSortControls } from "@/app/components/article/article-sort-controls";
import { PaginationNav } from "@/app/components/article/pagination-nav";
import type {
  ArticlePage,
  ArticleSearchParams,
} from "@/app/lib/article/article-types";
import {
  buildArticleSearchUrl,
  getParam,
  getSortConfig,
} from "@/app/lib/article/article-utils";
import { PageHeading } from "@/app/components/ui/page-heading";
import { MUTED_LINK } from "@/app/components/ui/arrow-link";

type PaginatedArticleListProps = {
  page: ArticlePage;
  searchParams: ArticleSearchParams;
  basePath?: string;
  /** Placed between the heading and the results, e.g. the search form. */
  search?: ReactNode;
};

/** Renders the article list with its heading, count, sort menu and pagination. */
export function PaginatedArticleList({
  page,
  searchParams,
  basePath = "/articles",
  search,
}: PaginatedArticleListProps) {
  const { items, currentPage, totalPages, totalCount } = page;
  const { sortBy } = getSortConfig(searchParams);

  return (
    <section>
      <div className="flex flex-col gap-6">
        <PageHeading>Articles</PageHeading>
        {search}

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
            <p className="text-sm text-muted tabular-nums">
              {totalCount} {totalCount === 1 ? "article" : "articles"}
            </p>
            <ArticleSortControls
              searchParams={searchParams}
              basePath={basePath}
            />
          </div>

          <ArticleList
            articles={items}
            basePath={basePath}
            sortBy={sortBy}
            empty={
              <NoArticles searchParams={searchParams} basePath={basePath} />
            }
          />
        </div>
      </div>

      {totalCount > 0 && (
        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
          searchParams={searchParams}
        />
      )}
    </section>
  );
}

/** The empty result, with a link that drops the keyword and every filter. */
function NoArticles({
  searchParams,
  basePath,
}: {
  searchParams: ArticleSearchParams;
  basePath: string;
}) {
  const keyword = getParam(searchParams.keyword);
  const filtered = ["keyword", "tag", "category", "series"].some(
    (key) => !!getParam(searchParams[key as keyof ArticleSearchParams]),
  );

  return (
    <div className="flex flex-col items-start gap-2 py-10">
      <p className="text-gray-700">
        {keyword ? `No articles match “${keyword}”.` : "No articles found."}
      </p>
      {filtered && (
        <Link
          href={buildArticleSearchUrl(basePath, searchParams, {
            keyword: null,
            tag: null,
            category: null,
            series: null,
            page: null,
          })}
          className={`inline-flex items-center gap-1 ${MUTED_LINK}`}
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear search
        </Link>
      )}
    </div>
  );
}
