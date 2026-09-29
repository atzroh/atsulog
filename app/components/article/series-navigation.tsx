import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

/**
 * Props for the SeriesNavigation component.
 */
type SeriesNavigationProps = {
  articles: ArticleMetadata[];
  metadata: ArticleMetadata;
};

/**
 * Renders navigation links for articles within the same series.
 * Handles calculating the previous and next articles based on seriesOrder.
 */
export function SeriesNavigation({
  articles,
  metadata,
}: SeriesNavigationProps) {
  const { series, seriesOrder, slug } = metadata;

  // Only render if the article belongs to a series
  if (!series || seriesOrder === null) {
    return null;
  }

  // Filter and sort articles in the same series
  const seriesArticles = articles
    .filter((a) => a.series === series && a.published)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));

  const currentIndex = seriesArticles.findIndex((a) => a.slug === slug);
  const previousInSeries =
    currentIndex > 0 ? seriesArticles[currentIndex - 1] : null;
  const nextInSeries =
    currentIndex < seriesArticles.length - 1
      ? seriesArticles[currentIndex + 1]
      : null;

  // If there's no other article in the series, don't render
  if (!previousInSeries && !nextInSeries) {
    return null;
  }

  return (
    <section className="bg-gray-50 rounded-xl p-8 mb-12">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 flex items-center justify-between">
        <span>More from {series}</span>
        <Link
          href={`/articles?series=${encodeURIComponent(series)}`}
          className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
        >
          View all in series &rarr;
        </Link>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {previousInSeries && (
          <Link
            href={`/articles/${previousInSeries.slug}`}
            className="group block p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center text-xs text-gray-400 mb-2">
              <ChevronLeft className="size-3 mr-1" />
              Previous Part
            </div>
            <div className="font-medium group-hover:text-sky-600 transition-colors">
              {previousInSeries.title}
            </div>
          </Link>
        )}
        {nextInSeries && (
          <Link
            href={`/articles/${nextInSeries.slug}`}
            className="group block p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center text-xs text-gray-400 mb-2 justify-end">
              Next Part
              <ChevronRight className="size-3 ml-1" />
            </div>
            <div className="font-medium group-hover:text-sky-600 transition-colors text-right">
              {nextInSeries.title}
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
