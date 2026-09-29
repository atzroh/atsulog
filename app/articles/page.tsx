import { PaginatedArticleList } from "@/app/components/article/paginated-article-list";
import type { Metadata } from "next";
import { getArticles } from "@/app/lib/article/article-repository";
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
    title: `Articles`,
    description: `Browse all articles on ${siteConfig.title}.`,
    creator: `@${siteConfig.twitter}`,
    images: [siteConfig.shareImage],
  },
};

/**
 * Renders the paginated articles list page with search and filtering.
 * @param props Route props including async search parameters.
 * @returns The articles page element.
 */
export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<ArticleSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  // 1. Data Fetching
  const allMetadata = await getArticles();
  const publishedMetadata = allMetadata.filter(
    (a) => a.published && a.slug !== siteConfig.aboutSlug,
  );

  // 2. Prepare Form Candidates
  const candidates = getTaxonomies(publishedMetadata);

  // 3. Filtering & Sorting
  const filteredArticles = filterArticles(
    publishedMetadata,
    resolvedSearchParams,
  );
  const { field, order } = getSortConfig(resolvedSearchParams);
  const sortedArticles = sortArticles(filteredArticles, field, order);

  // 4. Rendering
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
