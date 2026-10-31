import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { Tag } from "@/app/components/ui/tag";

type ArticleTaxonomiesProps = {
  article: ArticleMetadata;
  basePath?: string;
  className?: string;
};

/**
 * Renders a list of clickable taxonomy tags (Category, Series, and Tags) for an article.
 */
export function ArticleTaxonomies({
  article,
  basePath = "/articles",
  className = "",
}: ArticleTaxonomiesProps) {
  const { category, series, tags } = article;

  return (
    <div className={`flex flex-wrap gap-[0.5rem] ${className}`.trim()}>
      {series && (
        <Tag
          label={series}
          href={`${basePath}?series=${encodeURIComponent(series)}`}
          variant="series"
        />
      )}

      <Tag
        label={category}
        href={`${basePath}?category=${encodeURIComponent(category)}`}
        variant="category"
      />

      {tags.map((tag) => (
        <Tag
          key={tag}
          label={tag}
          href={`${basePath}?tag=${encodeURIComponent(tag)}`}
        />
      ))}
    </div>
  );
}
