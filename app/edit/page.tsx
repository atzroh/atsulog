import { getArticles } from "@/app/lib/article/article-repository";
import { PaginatedArticleList } from "@/app/components/article/paginated-article-list";
import { DraftArticleList } from "@/app/components/editor/draft-article-list";
import {
  filterArticles,
  getTaxonomies,
  searchArticles,
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

  const articles = await getArticles();

  const taxonomies = getTaxonomies(articles);

  const drafts = filterArticles(articles, resolvedSearchParams).filter(
    (a) => !a.published,
  );
  const sortedPublished = searchArticles(
    articles.filter((a) => a.published),
    resolvedSearchParams,
  );

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
