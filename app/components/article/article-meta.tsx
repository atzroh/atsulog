import { Calendar, RotateCcw, Eye } from "lucide-react";
import { formatDate } from "@/app/lib/article/article-utils";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

type ArticleMetaProps = {
  metadata: ArticleMetadata;
  className?: string;
};

/**
 * Displays article metadata (dates and view counts).
 */
export function ArticleMeta({ metadata, className = "" }: ArticleMetaProps) {
  const items = [
    {
      Icon: Calendar,
      text: formatDate(metadata.createdAt),
      title: "Created At",
    },
    {
      Icon: RotateCcw,
      text: formatDate(metadata.modifiedAt),
      title: "Modified At",
    },
    {
      Icon: Eye,
      text: `${metadata.viewCount.toLocaleString()} views`,
      title: "View Count",
    },
  ];

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted ${className}`}
    >
      {items.map(({ Icon, text, title }) => (
        <div key={title} className="flex items-center" title={title}>
          <Icon className="size-3.5 mr-1.5" aria-hidden="true" />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}
