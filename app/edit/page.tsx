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

export default async function EditDashboardPage({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const allMetadata = await getArticles();

  const taxonomies = getTaxonomies(allMetadata);

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
        <DraftArticleList articles={drafts} />

        <PaginatedArticleList
          articles={sortedPublished}
          searchParams={resolvedSearchParams}
          basePath="/edit"
        />
      </div>
    </main>
  );
}
