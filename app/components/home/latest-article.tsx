import Link from "next/link";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { ArticleList } from "@/app/components/article/article-list";
import { HomeSection } from "@/app/components/home/home-section";

/** The newest article, drawn as the same card the article list uses. */
export function LatestArticle({ article }: { article: ArticleMetadata }) {
  return (
    <HomeSection
      title="Latest"
      aside={
        <Link
          href="/articles"
          className="text-sm text-muted hover:text-foreground"
        >
          All articles
        </Link>
      }
    >
      <ArticleList articles={[article]} basePath="/articles" />
    </HomeSection>
  );
}
