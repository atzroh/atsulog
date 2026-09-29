import { NextResponse } from "next/server";
import {
  getArticleBySlug,
  getArticles,
} from "@/app/lib/article/article-repository";
import type { ArticleDetail } from "@/app/lib/article/article-types";
import { sortArticles } from "@/app/lib/article/article-utils";
import { buildAtomFeed } from "@/app/lib/feed/atom-feed";
import { siteConfig } from "@/app/lib/site-config";

/**
 * Route handler for the Atom feed of the latest published articles.
 * URL pattern: /feed.xml
 */
export async function GET() {
  const articles = await getArticles();
  const latest = sortArticles(
    articles.filter((a) => a.published && a.slug !== siteConfig.aboutSlug),
    "createdAt",
  ).slice(0, siteConfig.feedEntriesCount);

  const details = await Promise.all(
    latest.map((article) => getArticleBySlug(articles, article.slug)),
  );
  const entries = details.filter(
    (detail): detail is ArticleDetail => detail !== null,
  );

  return new NextResponse(buildAtomFeed(entries), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
