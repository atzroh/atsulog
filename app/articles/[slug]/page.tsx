import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/app/components/markdown/markdown-renderer";
import {
  getArticles,
  getArticleBySlug,
} from "@/app/lib/article/article-repository";
import { isAuthenticated } from "@/app/lib/auth/auth";
import { getLinkCards } from "@/app/lib/link-card/link-card-store";
import { collectLinkCardUrls } from "@/app/lib/link-card/link-card-utils";
import { ArticleMeta } from "@/app/components/article/article-meta";
import { ArticleTaxonomies } from "@/app/components/article/article-taxonomies";
import { SeriesNavigation } from "@/app/components/article/series-navigation";
import { siteConfig } from "@/app/lib/site-config";
import { buildPageMetadata } from "@/app/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  // A draft must not leak its title, even though the page itself 404s.
  if (!article || !article.metadata.published) {
    return {
      title: `Article Not Found | ${siteConfig.title}`,
    };
  }

  return buildPageMetadata({
    title: article.metadata.title,
    description: `Read "${article.metadata.title}" on ${siteConfig.title}.`,
    url: `${siteConfig.url}/articles/${slug}`,
    type: "article",
    publishedTime: article.metadata.createdAt,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articles = await getArticles();
  const articleDetail = await getArticleBySlug(slug);

  if (!articleDetail || !articleDetail.metadata.published) {
    notFound();
  }

  const { metadata: article, content } = articleDetail;

  const authenticated = await isAuthenticated();

  // Open Graph data for the paragraphs that are nothing but a URL.
  const cards = await getLinkCards(collectLinkCardUrls(content));

  return (
    <article className="py-10">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {article.title}
        </h1>

        <ArticleMeta article={article} className="mb-6" />

        <ArticleTaxonomies article={article} />
      </header>

      <div className="mb-16">
        <MarkdownRenderer content={content} cards={cards} />
      </div>

      <div className="mt-16">
        <SeriesNavigation article={article} articles={articles} />

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
              href={`/edit/${slug}`}
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
