import { PaginatedArticleList } from "@/app/components/article/paginated-article-list";
import type { Metadata } from "next";
import {
  getTaxonomies,
  searchArticles,
} from "@/app/lib/article/article-repository";
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

  const taxonomies = await getTaxonomies("public");
  const page = await searchArticles(
    resolvedSearchParams,
    "public",
    siteConfig.articlesPerPage,
  );

  return (
    <main>
      <ArticleSearchForm
        searchParams={resolvedSearchParams}
        candidates={taxonomies}
      />
      <PaginatedArticleList
        page={page}
        searchParams={resolvedSearchParams}
      />
    </main>
  );
}
