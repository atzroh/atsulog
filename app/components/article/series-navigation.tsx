import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  ArticleMetadata,
  SeriesNeighbors,
} from "@/app/lib/article/article-types";

/** Links to the previous and next published articles in the series, by seriesOrder. */
export function SeriesNavigation({
  series,
  previous: previousInSeries,
  next: nextInSeries,
}: SeriesNeighbors) {
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
          <SeriesLink article={previousInSeries} direction="previous" />
        )}
        {nextInSeries && <SeriesLink article={nextInSeries} direction="next" />}
      </div>
    </section>
  );
}

function SeriesLink({
  article,
  direction,
}: {
  article: ArticleMetadata;
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
    >
      <div
        className={`flex items-center text-xs text-gray-400 mb-2${isNext ? " justify-end" : ""}`}
      >
        {isNext ? (
          <>
            Next Part
            <ChevronRight className="size-3 ml-1" />
          </>
        ) : (
          <>
            <ChevronLeft className="size-3 mr-1" />
            Previous Part
          </>
        )}
      </div>
      <div
        className={`font-medium group-hover:text-sky-600 transition-colors${isNext ? " text-right" : ""}`}
      >
        {article.title}
      </div>
    </Link>
  );
}
