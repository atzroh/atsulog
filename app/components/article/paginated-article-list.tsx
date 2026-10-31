import { ArticleList } from "@/app/components/article/article-list";
import { ArticleSortControls } from "@/app/components/article/article-sort-controls";
import { PaginationNav } from "@/app/components/article/pagination-nav";
import type {
  ArticleMetadata,
  ArticleSearchParams,
} from "@/app/lib/article/article-types";
import { paginate } from "@/app/lib/article/article-utils";
import { siteConfig } from "@/app/lib/site-config";

type PaginatedArticleListProps = {
  articles: ArticleMetadata[];
  searchParams: ArticleSearchParams;
  basePath?: string;
};

/** Renders the article list with its heading, sort controls and pagination. */
export function PaginatedArticleList({
  articles,
  searchParams,
  basePath = "/articles",
}: PaginatedArticleListProps) {
  const {
    pageItems: pagedArticles,
    currentPage,
    totalPages,
  } = paginate(articles, searchParams.page, siteConfig.articlesPerPage);

  return (
    <section>
      {/* The heading owns the gap to the list; PaginationNav brings its own
          mt-[3rem], so the section needs no space-y of its own. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        <ArticleSortControls
          searchParams={searchParams}
          basePath={basePath}
        />
      </div>

      <ArticleList articles={pagedArticles} basePath={basePath} />
      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
        searchParams={searchParams}
      />
    </section>
  );
}
