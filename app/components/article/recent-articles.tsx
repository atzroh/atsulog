import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sortArticles } from "@/app/lib/article/article-utils";
import {
  ArticleList,
  type ArticleListProps,
} from "@/app/components/article/article-list";

import { siteConfig } from "@/app/lib/site-config";

/**
 * Renders a list of the most recent articles.
 */
export function RecentArticles({ articles }: ArticleListProps) {
  const recentArticles = sortArticles(articles, "createdAt").slice(
    0,
    siteConfig.recentArticlesCount,
  );

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Recent Articles
        </h1>
        <ArticleList articles={recentArticles} />
        <div className="mt-12">
          <Link
            href="/articles"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors group"
          >
            <span>View all articles</span>
            <ArrowRight className="size-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
