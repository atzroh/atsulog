import { PaginatedArticleList } from "@/app/components/article/paginated-article-list";
import type { Metadata } from "next";
import { getPublicArticles } from "@/app/lib/article/article-repository";
import {
  sortArticles,
  getTaxonomies,
  filterArticles,
  getSortConfig,
} from "@/app/lib/article/article-utils";
import { ArticleSearchForm } from "@/app/components/article/article-search-form";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";
import { siteConfig } from "@/app/lib/site-config";
import { buildPageMetadata } from "@/app/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Articles",
  ogTitle: `Articles | ${siteConfig.title}`,
  description: `Browse all articles on ${siteConfig.title}.`,
  url: `${siteConfig.url}/articles`,
  type: "website",
  locale: siteConfig.locale,
});

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const publishedMetadata = await getPublicArticles();

  const candidates = getTaxonomies(publishedMetadata);

  const filteredArticles = filterArticles(
    publishedMetadata,
    resolvedSearchParams,
  );
  const { field, order } = getSortConfig(resolvedSearchParams);
  const sortedArticles = sortArticles(filteredArticles, field, order);

  return (
    <main>
      <ArticleSearchForm
        searchParams={resolvedSearchParams}
        candidates={candidates}
      />
      <PaginatedArticleList
        articles={sortedArticles}
        searchParams={resolvedSearchParams}
      />
    </main>
  );
}
