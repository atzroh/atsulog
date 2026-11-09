import { siteConfig } from "@/app/lib/site-config";
import { buildPageMetadata } from "@/app/lib/page-metadata";
import {
  getCategoryCounts,
  getTagCounts,
  searchArticles,
} from "@/app/lib/article/article-repository";
import { HeroTitle } from "@/app/components/home/hero-title";
import { LatestArticle } from "@/app/components/home/latest-article";
import { CategoryGrid } from "@/app/components/home/category-grid";
import { TagCloud } from "@/app/components/home/tag-cloud";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: `Home | ${siteConfig.title}`,
  twitterTitle: "Home",
  description: `${siteConfig.title} is a personal blog.`,
  url: siteConfig.url,
  type: "website",
  locale: siteConfig.locale,
});

export default async function Home() {
  const [latestPage, categories, tags] = await Promise.all([
    // The default order is newest first.
    searchArticles({}, "public", 1),
    getCategoryCounts("public"),
    getTagCounts("public"),
  ]);
  const latest = latestPage.items[0];

  return (
    <div className="space-y-16">
      <HeroTitle count={latestPage.totalCount} />
      {latest && <LatestArticle article={latest} />}
      <CategoryGrid categories={categories} />
      <TagCloud tags={tags} />
    </div>
  );
}
