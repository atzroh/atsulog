import type { MetadataRoute } from "next";
import { searchArticles } from "@/app/lib/article/article-repository";
import { siteConfig } from "@/app/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // "published" keeps the about page, which "public" leaves out.
  const { items } = await searchArticles({}, "published");

  return [
    { url: siteConfig.url },
    { url: `${siteConfig.url}/articles` },
    { url: `${siteConfig.url}/privacy` },
    ...items.map((article) => ({
      url: `${siteConfig.url}/articles/${article.slug}`,
      lastModified: article.modifiedAt,
    })),
  ];
}
