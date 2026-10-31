import { siteConfig } from "@/app/lib/site-config";
import { buildPageMetadata } from "@/app/lib/page-metadata";
import { getPublicArticles } from "@/app/lib/article/article-repository";
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
  const articles = await getPublicArticles();

  return (
    <div className="space-y-16">
      <HeroTitle />
      <SiteStats articles={articles} />
      <RecentArticles articles={articles} />
    </div>
  );
}
