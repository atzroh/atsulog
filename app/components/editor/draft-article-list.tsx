import Link from "next/link";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

// --- Types ---

type DraftArticleListProps = {
  articles: ArticleMetadata[];
  basePath?: string;
};

// --- Main Component ---

/**
 * Organism component that renders a plain list of draft article links.
 * Unlike PaginatedArticleList, this has no sorting or pagination.
 * @param props - Component props.
 * @returns A section containing the drafts heading and a list of links.
 */
export function DraftArticleList({
  articles,
  basePath = "/edit",
}: DraftArticleListProps) {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Drafts ({articles.length})
      </h1>

      {articles.length === 0 ? (
        <p className="text-sm text-gray-400">No drafts found.</p>
      ) : (
        <ul className="space-y-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`${basePath}/${article.slug}`}
                className="text-sky-600 hover:text-sky-700 hover:underline transition-colors"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
