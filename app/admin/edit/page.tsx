import { searchArticles } from "@/app/lib/article/article-repository";
import { PaginatedArticleList } from "@/app/components/article/paginated-article-list";
import { DraftArticleList } from "@/app/components/editor/draft-article-list";
import { ArticleSearchForm } from "@/app/components/article/article-search-form";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";
import { siteConfig } from "@/app/lib/site-config";

export default async function EditListPage({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const { items: drafts } = await searchArticles(
    resolvedSearchParams,
    "drafts",
  );
  const published = await searchArticles(
    resolvedSearchParams,
    "published",
    siteConfig.articlesPerPage,
  );

  return (
    <main className="space-y-12">
      <ArticleSearchForm
        searchParams={resolvedSearchParams}
        action="/admin/edit"
      />

      <div className="space-y-16">
        <DraftArticleList articles={drafts} />

        <PaginatedArticleList
          page={published}
          searchParams={resolvedSearchParams}
          basePath="/admin/edit"
        />
      </div>
    </main>
  );
}
