import { SearchX } from "lucide-react";
import Link from "next/link";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { ArticleMeta } from "@/app/components/article/article-meta";
import { ArticleTaxonomies } from "@/app/components/article/article-taxonomies";

/**
 * Props for the ArticleList component.
 */
export type ArticleListProps = {
  articles: ArticleMetadata[];
  basePath?: string;
};

/**
 * Renders a list of article items.
 * Shows a "not found" state if the list is empty.
 */
export function ArticleList({
  articles,
  basePath = "/articles",
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
        <div className="p-4 bg-white rounded-2xl shadow-sm mb-6">
          <SearchX className="size-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-400">No articles found</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-[1.5rem]">
      {articles.map((article) => (
        <ArticleListItem
          key={article.slug}
          article={article}
          basePath={basePath}
        />
      ))}
    </div>
  );
}

/**
 * Renders an individual article item within a list.
 */
function ArticleListItem({
  article,
  basePath,
}: {
  article: ArticleMetadata;
  basePath: string;
}) {
  const articleHref = `${basePath}/${article.slug}`;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-sky-200 transition-all duration-300 flex flex-col p-[1.5rem] space-y-[1.25rem]">
      <Link href={articleHref} className="space-y-[1.25rem]">
        {/* Article Title */}
        <h2 className="text-xl font-bold leading-tight group-hover:text-sky-600 transition-colors duration-300">
          {article.title}
        </h2>

        {/* Metadata (Dates, Views) */}
        <ArticleMeta metadata={article} />
      </Link>

      {/* Taxonomy Links (Category, Series, Tags) - Kept outside the main link for separate interaction */}
      <ArticleTaxonomies
        metadata={article}
        basePath={basePath}
        className="pt-[0.25rem]"
      />
    </div>
  );
}
