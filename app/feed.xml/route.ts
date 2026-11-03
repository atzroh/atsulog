import { NextResponse } from "next/server";
import { getLatestArticleDetails } from "@/app/lib/article/article-repository";
import { buildAtomFeed } from "@/app/lib/feed/atom-feed";
import { siteConfig } from "@/app/lib/site-config";

export async function GET() {
  const entries = await getLatestArticleDetails(siteConfig.feedEntriesCount);

  return new NextResponse(buildAtomFeed(entries), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
