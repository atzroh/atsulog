import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
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
import { PageHeading } from "@/app/components/ui/page-heading";

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
    <article className="py-10">
      <header className="mb-12">
        <PageHeading className="mb-4">{article.title}</PageHeading>

        <ArticleMeta article={article} className="mb-6" />

        <ArticleTaxonomies article={article} />
      </header>

      <div className="mb-16">
        <MarkdownRenderer content={content} cards={cards} withToc />
      </div>

      <div className="mt-16">
        {neighbors && <SeriesNavigation {...neighbors} />}

        <nav
          aria-label="Article navigation"
          className="border-t pt-[2.5rem] flex items-center justify-between"
        >
          <Link
            href="/articles"
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center"
          >
            <ArrowLeft className="size-[1rem] mr-[0.5rem]" />
            Back to Articles
          </Link>

          {authenticated && (
            <Link
              href={`/admin/edit/${slug}`}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center"
            >
              <Pencil className="size-[1rem] mr-[0.5rem]" />
              Edit this article
            </Link>
          )}
        </nav>
      </div>
    </article>
  );
}
