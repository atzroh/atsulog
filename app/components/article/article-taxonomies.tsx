import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { Tag } from "@/app/components/ui/tag";

/**
 * Props for the ArticleTaxonomies component.
 */
type ArticleTaxonomiesProps = {
  metadata: ArticleMetadata;
  basePath?: string;
  className?: string;
};

/**
 * Renders a list of clickable taxonomy tags (Category, Series, and Tags) for an article.
 */
export function ArticleTaxonomies({
  metadata,
  basePath = "/articles",
  className = "",
}: ArticleTaxonomiesProps) {
  const { category, series, tags } = metadata;

  return (
    <div className={`flex flex-wrap gap-[0.5rem] ${className}`.trim()}>
      {/* Series Link (if available) */}
      {series && (
        <Tag
          label={series}
          href={`${basePath}?series=${encodeURIComponent(series)}`}
          variant="series"
        />
      )}

      {/* Category Link */}
      <Tag
        label={category}
        href={`${basePath}?category=${encodeURIComponent(category)}`}
        variant="category"
      />

      {/* Tag Links */}
      {tags.map((tag) => (
        <Tag key={tag} label={tag} href={`${basePath}?tag=${tag}`} />
      ))}
    </div>
  );
}
