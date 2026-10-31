import { Calendar, RotateCcw } from "lucide-react";
import { formatDate } from "@/app/lib/date-format";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

type ArticleMetaProps = {
  metadata: ArticleMetadata;
  className?: string;
};

/**
 * Displays article metadata (created and modified dates).
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
