import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/edit", "/login"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
