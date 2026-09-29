import { getArticles } from "@/app/lib/article/article-repository";
import { PaginatedArticleList } from "@/app/components/article/paginated-article-list";
import { DraftArticleList } from "@/app/components/editor/draft-article-list";
import {
  sortArticles,
  getTaxonomies,
  filterArticles,
  getSortConfig,
} from "@/app/lib/article/article-utils";
import { ArticleSearchForm } from "@/app/components/article/article-search-form";
import { CreateArticleSection } from "@/app/components/editor/create-article-section";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";

/**
 * Renders the page for article management with search and filtering.
 * @param props - Route props including async search parameters.
 * @returns The article management page element.
 */
export default async function EditDashboardPage({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  // 1. Data Fetching
  const allMetadata = await getArticles();

  // 2. Prepare Form Candidates
  const taxonomies = getTaxonomies(allMetadata);

  // 3. Filtering & Sorting
  const filteredArticles = filterArticles(allMetadata, resolvedSearchParams);

  const drafts = filteredArticles.filter((a) => !a.published);
  const publishedArticles = filteredArticles.filter((a) => a.published);

  const { field, order } = getSortConfig(resolvedSearchParams);
  const sortedPublished = sortArticles(publishedArticles, field, order);

  return (
    <main className="space-y-12">
      <CreateArticleSection />

      <ArticleSearchForm
        searchParams={resolvedSearchParams}
        candidates={taxonomies}
        action="/edit"
      />

      <div className="space-y-16">
        <DraftArticleList articles={drafts} basePath="/edit" />

        <PaginatedArticleList
          articles={sortedPublished}
          searchParams={resolvedSearchParams}
          basePath="/edit"
        />
      </div>
    </main>
  );
}
