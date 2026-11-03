import { siteConfig } from "@/app/lib/site-config";
import { buildPageMetadata } from "@/app/lib/page-metadata";
import {
  getSiteStats,
  getTaxonomies,
  searchArticles,
} from "@/app/lib/article/article-repository";
import { RecentArticles } from "@/app/components/article/recent-articles";
import { HeroTitle } from "@/app/components/home/hero-title";
import { SiteStats } from "@/app/components/home/site-stats";
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
  const taxonomies = await getTaxonomies("public");
  const stats = await getSiteStats("public");
  // The default order is newest first.
  const { items: recentArticles } = await searchArticles(
    {},
    "public",
    siteConfig.recentArticlesCount,
  );

  return (
    <div className="space-y-16">
      <HeroTitle />
      <SiteStats taxonomies={taxonomies} stats={stats} />
      <RecentArticles articles={recentArticles} />
    </div>
  );
}
