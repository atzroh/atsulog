import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { taxonomyHref } from "@/app/lib/article/article-utils";
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
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {series && (
        <Tag
          label={series}
          href={taxonomyHref(basePath, "series", series)}
          variant="series"
        />
      )}

      <Tag
        label={category}
        href={taxonomyHref(basePath, "category", category)}
        variant="category"
      />

      {tags.map((tag) => (
        <Tag key={tag} label={tag} href={taxonomyHref(basePath, "tag", tag)} />
      ))}
    </div>
  );
}
