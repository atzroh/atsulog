import { Tag } from "@/app/components/ui/tag";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";
import {
  buildArticleSearchUrl,
  getParam,
  splitTags,
} from "@/app/lib/article/article-utils";

type ActiveFiltersProps = {
  searchParams: ArticleSearchParams;
  basePath: string;
};

/** The series, category and tag filters in effect, each a link that drops it. */
export function ActiveFilters({ searchParams, basePath }: ActiveFiltersProps) {
  const series = getParam(searchParams.series);
  const category = getParam(searchParams.category);
  const tags = splitTags(getParam(searchParams.tag));

  if (!series && !category && tags.length === 0) return null;

  const without = (updates: Record<string, string | null>) =>
    buildArticleSearchUrl(basePath, searchParams, { ...updates, page: null });

  return (
    <div className="flex flex-wrap gap-2 px-4.5">
      {series && (
        <Tag
          label={series}
          href={without({ series: null })}
          variant="series"
          removable
        />
      )}
      {category && (
        <Tag
          label={category}
          href={without({ category: null })}
          variant="category"
          removable
        />
      )}
      {tags.map((tag) => (
        <Tag
          key={tag}
          label={tag}
          href={without({
            tag: tags.filter((t) => t !== tag).join(", ") || null,
          })}
          removable
        />
      ))}
    </div>
  );
}
