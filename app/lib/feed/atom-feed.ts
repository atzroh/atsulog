import type { ArticleDetail } from "@/app/lib/article/article-types";
import { renderFeedMarkdown } from "@/app/lib/markdown/markdown-rendering";
import { siteConfig } from "@/app/lib/site-config";

const SITE_URL = `${siteConfig.url}/`;
const FEED_URL = `${siteConfig.url}/feed.xml`;

/** Characters XML 1.0 does not allow, even when escaped. */
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

/** Escapes a value for use in XML text or a quoted attribute. */
function escapeXml(value: string): string {
  return value
    .replace(INVALID_XML_CHARS, "")
    .replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

/** Normalizes a stored date to the RFC 3339 form Atom requires. */
function toRfc3339(value: string | number): string {
  return new Date(value).toISOString();
}

/** Renders one article as an Atom entry, with its full body as HTML. */
function renderEntry({ metadata, content }: ArticleDetail): string {
  const url = `${siteConfig.url}/articles/${metadata.slug}`;
  const terms = [...new Set([metadata.category, ...metadata.tags])].filter(
    Boolean,
  );

  return [
    "  <entry>",
    `    <id>${escapeXml(url)}</id>`,
    `    <title>${escapeXml(metadata.title)}</title>`,
    `    <link rel="alternate" type="text/html" href="${escapeXml(url)}"/>`,
    `    <published>${toRfc3339(metadata.createdAt)}</published>`,
    `    <updated>${toRfc3339(metadata.modifiedAt)}</updated>`,
    ...terms.map((term) => `    <category term="${escapeXml(term)}"/>`),
    `    <content type="html">${escapeXml(renderFeedMarkdown(content, url))}</content>`,
    "  </entry>",
  ].join("\n");
}

/**
 * Builds the Atom feed document for the given articles, in the order given.
 */
export function buildAtomFeed(entries: ArticleDetail[]): string {
  // The feed changes whenever its newest-modified entry does.
  const updated = entries.length
    ? toRfc3339(
        Math.max(...entries.map((e) => Date.parse(e.metadata.modifiedAt))),
      )
    : toRfc3339(Date.now());

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${siteConfig.htmlLang}">`,
    `  <id>${escapeXml(SITE_URL)}</id>`,
    `  <title>${escapeXml(siteConfig.title)}</title>`,
    `  <updated>${updated}</updated>`,
    `  <author><name>${escapeXml(siteConfig.title)}</name></author>`,
    `  <link rel="alternate" type="text/html" href="${escapeXml(SITE_URL)}"/>`,
    `  <link rel="self" type="application/atom+xml" href="${escapeXml(FEED_URL)}"/>`,
    ...entries.map(renderEntry),
    "</feed>",
    "",
  ].join("\n");
}
