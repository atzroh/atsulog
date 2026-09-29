import { siteConfig } from "@/app/lib/site-config";
import { getArticles } from "@/app/lib/article/article-repository";
import { RecentArticles } from "@/app/components/article/recent-articles";
import { HeroTitle } from "@/app/components/home/hero-title";
import { SiteStats } from "@/app/components/home/site-stats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Home | ${siteConfig.title}`,
  description: `${siteConfig.title} is a personal blog.`,
  openGraph: {
    title: `Home | ${siteConfig.title}`,
    description: `${siteConfig.title} is a personal blog.`,
    url: siteConfig.url,
    siteName: siteConfig.title,
    locale: siteConfig.locale,
    type: "website",
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
    title: `Home`,
    description: `${siteConfig.title} is a personal blog.`,
    creator: `@${siteConfig.twitter}`,
    images: [siteConfig.shareImage],
  },
};

export default async function Home() {
  const allArticles = await getArticles();
  const articles = allArticles.filter(
    (a) => a.published && a.slug !== siteConfig.aboutSlug,
  );

  return (
    <div className="space-y-16">
      <HeroTitle />
      <SiteStats articles={articles} />
      <RecentArticles articles={articles} />
    </div>
  );
}
