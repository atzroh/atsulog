import { Calendar, RotateCcw, Eye } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/app/lib/article/article-utils";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

/**
 * Props for the ArticleMeta component.
 */
type ArticleMetaProps = {
  metadata: ArticleMetadata;
  articleHref?: string;
  className?: string;
};

/**
 * A reusable component to display article metadata (dates and view counts).
 * If articleHref is provided, the metadata items will link to that URL.
 */
export function ArticleMeta({
  metadata,
  articleHref,
  className = "",
}: ArticleMetaProps) {
  const itemClassName = articleHref
    ? "flex items-center hover:text-sky-600 transition-colors duration-200"
    : "flex items-center";

  const renderItem = (
    icon: React.ReactNode,
    text: string,
    title: string,
    key: string,
  ) => {
    const commonProps = {
      className: itemClassName,
      title: title,
    };

    const innerContent = (
      <>
        {icon}
        <span>{text}</span>
      </>
    );

    if (articleHref) {
      return (
        <Link key={key} href={articleHref} {...commonProps}>
          {innerContent}
        </Link>
      );
    }

    return (
      <div key={key} {...commonProps}>
        {innerContent}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted ${className}`}
    >
      {/* Creation Date */}
      {renderItem(
        <Calendar className="size-3.5 mr-1.5" aria-hidden="true" />,
        formatDate(metadata.createdAt),
        "Created At",
        "created",
      )}

      {/* Modification Date */}
      {renderItem(
        <RotateCcw className="size-3.5 mr-1.5" aria-hidden="true" />,
        formatDate(metadata.modifiedAt),
        "Modified At",
        "modified",
      )}

      {/* Total View Count */}
      {renderItem(
        <Eye className="size-3.5 mr-1.5" aria-hidden="true" />,
        `${metadata.viewCount.toLocaleString()} views`,
        "View Count",
        "views",
      )}
    </div>
  );
}
