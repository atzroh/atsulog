import { ArticleList } from "@/app/components/article/article-list";
import { ArticleSortControls } from "@/app/components/article/article-sort-controls";
import { PaginationNav } from "@/app/components/article/pagination-nav";
import type {
  ArticlePage,
  ArticleSearchParams,
} from "@/app/lib/article/article-types";
import { PageHeading } from "@/app/components/ui/page-heading";

type PaginatedArticleListProps = {
  page: ArticlePage;
  searchParams: ArticleSearchParams;
  basePath?: string;
};

/** Renders the article list with its heading, sort controls and pagination. */
export function PaginatedArticleList({
  page,
  searchParams,
  basePath = "/articles",
}: PaginatedArticleListProps) {
  const { items: pagedArticles, currentPage, totalPages } = page;

  return (
    <section>
      {/* The heading owns the gap to the list; PaginationNav brings its own
          mt-[3rem], so the section needs no space-y of its own. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeading>Articles</PageHeading>
        <ArticleSortControls searchParams={searchParams} basePath={basePath} />
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
