import { ArrowLeft, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/app/components/markdown/markdown-renderer";
import {
  getArticles,
  getArticleBySlug,
  incrementViewCount,
} from "@/app/lib/article/article-repository";
import { isAuthenticated } from "@/app/lib/auth/auth";
import { ArticleMeta } from "@/app/components/article/article-meta";
import { ArticleTaxonomies } from "@/app/components/article/article-taxonomies";
import { SeriesNavigation } from "@/app/components/article/series-navigation";
import { siteConfig } from "@/app/lib/site-config";

/**
 * Generates dynamic metadata for the article page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const articles = await getArticles();
  const article = await getArticleBySlug(articles, slug);

  if (!article) {
    return {
      title: `Article Not Found | ${siteConfig.title}`,
    };
  }

  return {
    title: article.metadata.title,
    description: `Read "${article.metadata.title}" on ${siteConfig.title}.`,
    openGraph: {
      title: article.metadata.title,
      description: `Read "${article.metadata.title}" on ${siteConfig.title}.`,
      url: `${siteConfig.url}/articles/${slug}`,
      siteName: siteConfig.title,
      type: "article",
      publishedTime: article.metadata.createdAt,
      images: [
        {
          url: siteConfig.shareImage,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metadata.title,
      description: `Read "${article.metadata.title}" on ${siteConfig.title}.`,
      creator: `@${siteConfig.twitter}`,
      images: [siteConfig.shareImage],
    },
  };
}

/**
 * Renders an individual article detail page.
 * Increments the view count on every render, except when the admin is authenticated.
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articles = await getArticles();
  const articleDetail = await getArticleBySlug(articles, slug);

  if (!articleDetail || !articleDetail.metadata.published) {
    notFound();
  }

  const { metadata, content } = articleDetail;

  const authenticated = await isAuthenticated();

  // Record a view for this article (skip when the admin is viewing)
  if (!authenticated) {
    await incrementViewCount(articles, slug);
  }

  return (
    <article className="py-10">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          {metadata.title}
        </h1>

        {/* Article Metadata (Dates, Views) */}
        <ArticleMeta metadata={metadata} className="mb-6" />

        {/* Taxonomy Links (Category, Series, Tags) */}
        <ArticleTaxonomies metadata={metadata} />
      </header>

      {/* Main Article Content */}
      <div className="mb-16">
        <MarkdownRenderer content={content} />
      </div>

      {/* Footer Navigation */}
      <div className="mt-16">
        {/* Series Navigation (Previous/Next) */}
        <SeriesNavigation metadata={metadata} articles={articles} />

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
