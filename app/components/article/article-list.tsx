import { SearchX } from "lucide-react";
import Link from "next/link";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { ArticleMeta } from "@/app/components/article/article-meta";
import { ArticleTaxonomies } from "@/app/components/article/article-taxonomies";

type ArticleListProps = {
  articles: ArticleMetadata[];
  basePath: string;
};

/** The article cards, or a "not found" state when there are none. */
export function ArticleList({ articles, basePath }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
          <SearchX className="size-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-muted">No articles found</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
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

function ArticleListItem({
  article,
  basePath,
}: {
  article: ArticleMetadata;
  basePath: string;
}) {
  const articleHref = `${basePath}/${article.slug}`;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-300 transition-colors flex flex-col p-6 space-y-5">
      <Link href={articleHref} className="space-y-5">
        <h2 className="text-xl font-bold leading-tight group-hover:text-sky-600 transition-colors">
          {article.title}
        </h2>
        <ArticleMeta article={article} />
      </Link>

      {/* Kept outside the main link so each taxonomy link works on its own */}
      <ArticleTaxonomies
        article={article}
        basePath={basePath}
        className="pt-1"
      />
    </div>
  );
}
