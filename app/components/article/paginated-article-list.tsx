import { ArticleList } from "@/app/components/article/article-list";
import { ArticleSortControls } from "@/app/components/article/article-sort-controls";
import { PaginationNav } from "@/app/components/article/pagination-nav";
import type {
  ArticleMetadata,
  ArticleSearchParams,
} from "@/app/lib/article/article-types";
import { getParam } from "@/app/lib/article/article-utils";
import { siteConfig } from "@/app/lib/site-config";

// --- Types ---

type PaginatedArticleListProps = {
  articles: ArticleMetadata[];
  searchParams: ArticleSearchParams;
  basePath?: string;
};

// --- Main Component ---

/**
 * Organism component that renders a list of articles with pagination navigation and a title.
 * @param props - Component props.
 * @returns A section containing the title, article list, and pagination controls.
 */
export function PaginatedArticleList({
  articles,
  searchParams,
  basePath = "/articles",
}: PaginatedArticleListProps) {
  // Parse current page
  const rawPage = Number.parseInt(getParam(searchParams.page, "1"), 10);
  const requestedPage = rawPage > 0 ? rawPage : 1;

  // Calculate pagination window
  const totalPages = Math.max(
    1,
    Math.ceil(articles.length / siteConfig.articlesPerPage),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * siteConfig.articlesPerPage;
  const pagedArticles = articles.slice(
    startIndex,
    startIndex + siteConfig.articlesPerPage,
  );

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
