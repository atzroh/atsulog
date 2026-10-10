import Link from "next/link";
import type { ArticleMetadata } from "@/app/lib/article/article-types";

/**
 * A plain list of draft links, without the sorting and pagination of
 * PaginatedArticleList.
 */
export function DraftArticleList({ articles }: { articles: ArticleMetadata[] }) {
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
                href={`/edit/${article.slug}`}
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
