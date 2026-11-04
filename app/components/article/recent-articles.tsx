import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { ArticleList } from "@/app/components/article/article-list";
import { PageHeading } from "@/app/components/ui/page-heading";

export function RecentArticles({ articles }: { articles: ArticleMetadata[] }) {
  return (
    <section>
      <PageHeading className="mb-8">Recent Articles</PageHeading>
      <ArticleList articles={articles} />
      <div className="mt-12">
        <Link
          href="/articles"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors group"
        >
          <span>View all articles</span>
          <ArrowRight className="size-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
