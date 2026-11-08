import { siteConfig } from "@/app/lib/site-config";
import { buildPageMetadata } from "@/app/lib/page-metadata";
import { HeroTitle } from "@/app/components/home/hero-title";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: `Home | ${siteConfig.title}`,
  twitterTitle: "Home",
  description: `${siteConfig.title} is a personal blog.`,
  url: siteConfig.url,
  type: "website",
  locale: siteConfig.locale,
});

export default function Home() {
  return (
    <div className="space-y-16">
      <HeroTitle />
    </div>
  );
}
