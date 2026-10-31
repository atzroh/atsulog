import type { Metadata } from "next";

import { siteConfig } from "@/app/lib/site-config";

/** Fields every public page shares: the share image, site name and card. */
export function buildPageMetadata({
  title,
  ogTitle = title,
  twitterTitle = title,
  description,
  url,
  type,
  publishedTime,
  locale,
}: {
  title: string;
  ogTitle?: string;
  twitterTitle?: string;
  description: string;
  url: string;
  type: "website" | "article";
  publishedTime?: string;
  locale?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: siteConfig.title,
      ...(locale && { locale }),
      type,
      ...(publishedTime && { publishedTime }),
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
      title: twitterTitle,
      description,
      creator: `@${siteConfig.twitter}`,
      images: [siteConfig.shareImage],
    },
  };
}
