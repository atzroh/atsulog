import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  ArticleMetadata,
  SeriesNeighbors,
} from "@/app/lib/article/article-types";
import { taxonomyHref } from "@/app/lib/article/article-utils";
import { SECTION_LABEL } from "@/app/components/ui/label-styles";
import { ArrowLink } from "@/app/components/ui/arrow-link";

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
    <section className="bg-gray-50 rounded-lg p-6 mb-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className={SECTION_LABEL}>More from {series}</h3>
        <ArrowLink href={taxonomyHref("/articles", "series", series)}>
          View all in series
        </ArrowLink>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        className={`flex items-center text-xs text-muted mb-2${isNext ? " justify-end" : ""}`}
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
