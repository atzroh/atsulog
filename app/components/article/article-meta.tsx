import { Calendar, RotateCcw } from "lucide-react";
import { formatDate } from "@/app/lib/date-format";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

type ArticleMetaProps = {
  article: ArticleMetadata;
  className?: string;
};

/** Created and modified dates; the icons sit a shade lighter than the digits. */
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
      className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted tabular-nums ${className}`}
    >
      {items.map(({ Icon, text, title }) => (
        <div key={title} className="flex items-center" title={title}>
          <Icon className="size-3.5 mr-1.5 text-gray-400" aria-hidden="true" />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}
