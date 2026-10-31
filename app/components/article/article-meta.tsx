import { Calendar, RotateCcw } from "lucide-react";
import { formatDate } from "@/app/lib/date-format";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

type ArticleMetaProps = {
  article: ArticleMetadata;
  className?: string;
};

/**
 * Displays article metadata (created and modified dates).
 */
export function ArticleMeta({ article, className = "" }: ArticleMetaProps) {
  const items = [
    {
      Icon: Calendar,
      text: formatDate(article.createdAt),
      title: "Created At",
    },
    {
      Icon: RotateCcw,
      text: formatDate(article.modifiedAt),
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
