import { Images, Plus } from "lucide-react";
import {
  getTaxonomies,
  searchArticles,
} from "@/app/lib/article/article-repository";
import { PaginatedArticleList } from "@/app/components/article/paginated-article-list";
import { DraftArticleList } from "@/app/components/editor/draft-article-list";
import { ArticleSearchForm } from "@/app/components/article/article-search-form";
import { DashboardLinkSection } from "@/app/components/editor/dashboard-link-section";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";
import { siteConfig } from "@/app/lib/site-config";

export default async function EditDashboardPage({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const taxonomies = await getTaxonomies("all");

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
      <DashboardLinkSection
        title="Create Articles"
        href="/edit/create"
        icon={Plus}
        label="New Articles"
      />

      <DashboardLinkSection
        title="Images"
        href="/edit/images"
        icon={Images}
        label="Manage Images"
      />

      <ArticleSearchForm
        searchParams={resolvedSearchParams}
        candidates={taxonomies}
        action="/edit"
      />

      <div className="space-y-16">
        <DraftArticleList articles={drafts} />

        <PaginatedArticleList
          page={published}
          searchParams={resolvedSearchParams}
          basePath="/edit"
        />
      </div>
    </main>
  );
}
