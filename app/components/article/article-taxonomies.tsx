import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { taxonomyHref } from "@/app/lib/article/article-utils";
import { Tag } from "@/app/components/ui/tag";

type ArticleTaxonomiesProps = {
  article: ArticleMetadata;
  basePath?: string;
  className?: string;
};

/** The article's series, category and tags, each linking to its filtered list. */
export function ArticleTaxonomies({
  article,
  basePath = "/articles",
  className = "",
}: ArticleTaxonomiesProps) {
  const { category, series, tags } = article;

  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-1 ${className}`.trim()}>
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
