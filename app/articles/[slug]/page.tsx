import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/app/components/markdown/markdown-renderer";
import {
  getArticleBySlug,
  getSeriesNeighbors,
} from "@/app/lib/article/article-repository";
import { isAuthenticated } from "@/app/lib/auth/auth";
import { getLinkCards } from "@/app/lib/link-card/link-card-store";
import { collectLinkCardUrls } from "@/app/lib/link-card/link-card-utils";
import { ArticleMeta } from "@/app/components/article/article-meta";
import { ArticleTaxonomies } from "@/app/components/article/article-taxonomies";
import { SeriesNavigation } from "@/app/components/article/series-navigation";
import { siteConfig } from "@/app/lib/site-config";
import { buildPageMetadata } from "@/app/lib/page-metadata";
import { PageNav, PageNavLink } from "@/app/components/ui/page-nav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getArticleBySlug(slug);

  // A draft must not leak its title, even though the page itself 404s.
  if (!detail || !detail.metadata.published) {
    return {
      title: `Article Not Found | ${siteConfig.title}`,
    };
  }

  return buildPageMetadata({
    title: detail.metadata.title,
    description: `Read "${detail.metadata.title}" on ${siteConfig.title}.`,
    url: `${siteConfig.url}/articles/${slug}`,
    type: "article",
    publishedTime: detail.metadata.createdAt,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getArticleBySlug(slug);

  if (!detail || !detail.metadata.published) {
    notFound();
  }

  const { metadata: article, content } = detail;
  const neighbors = await getSeriesNeighbors(article);

  const authenticated = await isAuthenticated();

  // Open Graph data for the paragraphs that are nothing but a URL.
  const cards = await getLinkCards(collectLinkCardUrls(content));

  return (
    <article>
      <header className="mb-12">
        {/* PageHeading's size and weight, without the uppercase. */}
        <h1 className="mb-3 text-4xl font-light leading-snug tracking-tight">
          {article.title}
        </h1>

        <ArticleMeta article={article} className="mb-4" />

        <ArticleTaxonomies article={article} />
      </header>

      <div>
        <MarkdownRenderer content={content} cards={cards} withToc />
      </div>

      <div className="mt-16">
        {neighbors && <SeriesNavigation {...neighbors} />}

        <PageNav label="Article navigation">
          <PageNavLink href="/articles" icon={ArrowLeft}>
            Back to Articles
          </PageNavLink>

          {authenticated && (
            <PageNavLink href={`/admin/edit/${slug}`} icon={Pencil} iconAfter>
              Edit this article
            </PageNavLink>
          )}
        </PageNav>
      </div>
    </article>
  );
}
