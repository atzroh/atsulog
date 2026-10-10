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

export const metadata: Metadata = {
  title: "Articles",
  description: `Browse all articles on ${siteConfig.title}.`,
  openGraph: {
    title: `Articles | ${siteConfig.title}`,
    description: `Browse all articles on ${siteConfig.title}.`,
    url: `${siteConfig.url}/articles`,
    siteName: siteConfig.title,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: siteConfig.shareImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles",
    description: `Browse all articles on ${siteConfig.title}.`,
    creator: `@${siteConfig.twitter}`,
    images: [siteConfig.shareImage],
  },
};

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
