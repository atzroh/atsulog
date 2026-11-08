import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { ArticleList } from "@/app/components/article/article-list";
import { HomeSection } from "@/app/components/home/home-section";
import { ArrowLink } from "@/app/components/ui/arrow-link";

/** The newest article, drawn as the same card the article list uses. */
export function LatestArticle({ article }: { article: ArticleMetadata }) {
  return (
    <HomeSection
      title="Latest"
      aside={<ArrowLink href="/articles">All articles</ArrowLink>}
    >
      <ArticleList articles={[article]} basePath="/articles" />
    </HomeSection>
  );
}
