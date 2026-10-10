import type { Element, ElementContent, Properties, Text } from "hast";
import type { Paragraph } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import type {
  LinkCard,
  LinkCardMap,
} from "@/app/lib/link-card/link-card-types";
import { siteConfig } from "@/app/lib/site-config";

// Reached from the editor preview ("use client"): no node:*, no store, no fetcher.

/** Bounds the work one render can ask for. */
const MAX_CARDS_PER_ARTICLE = 20;
const COLLECT_CACHE_LIMIT = 8;

const SITE_ORIGIN = originOf(siteConfig.url);

/** parse only; attaching remark-gfm is what registers its autolink syntax. */
function createParser() {
  return unified().use(remarkParse).use(remarkGfm);
}

let parser: ReturnType<typeof createParser> | undefined;

// The article page parses twice per request, to collect and to render.
const collectCache = new Map<string, string[]>();

/**
 * Returns the URL a paragraph should be drawn as a card for, or null. A
 * paragraph holding nothing but a link whose text is the URL itself points
 * somewhere else rather than reading as prose. Shared with
 * collectLinkCardUrls so fetching and rendering agree on what counts.
 */
export function linkCardUrlOf(node: Paragraph): string | null {
  // A trailing space leaves an empty text node beside the link.
  const children = node.children.filter(
    (child) => child.type !== "text" || child.value.trim() !== "",
  );
  if (children.length !== 1) return null;

  const link = children[0];
  if (link.type !== "link" || link.children.length !== 1) return null;

  const text = link.children[0];
  if (text.type !== "text") return null;

  // Drops mailto:, relative links and javascript:.
  if (!/^https?:\/\//i.test(link.url)) return null;

  // GFM rewrites a bare `www.example.com` to an http URL.
  const isUrlItself =
    text.value === link.url ||
    (text.value.startsWith("www.") && link.url === `http://${text.value}`);
  if (!isUrlItself) return null;

  // Nothing to fetch from ourselves.
  if (originOf(link.url) === SITE_ORIGIN) return null;

  return link.url;
}

/**
 * The URLs this content renders as cards, in order. Top-level paragraphs only:
 * a card inside a list item or a quote breaks the block it sits in.
 */
export function collectLinkCardUrls(content: string): string[] {
  const cached = collectCache.get(content);
  if (cached !== undefined) return cached;

  parser ??= createParser();
  const tree = parser.parse(content);

  const urls: string[] = [];
  const seen = new Set<string>();
  for (const child of tree.children) {
    if (child.type !== "paragraph") continue;
    const url = linkCardUrlOf(child);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= MAX_CARDS_PER_ARTICLE) break;
  }

  if (collectCache.size >= COLLECT_CACHE_LIMIT) {
    collectCache.delete(collectCache.keys().next().value!);
  }
  collectCache.set(content, urls);
  return urls;
}

/**
 * The card element for a URL. Without data — the editor preview, or a link
 * that could not be read — the same frame carries the URL and its host.
 * Always a fresh tree: rehypeArticle rewrites properties in place.
 */
export function buildLinkCard(url: string, card?: LinkCard): Element {
  const data = card?.status === "ok" ? card : undefined;
  const title = data?.title || url;
  const siteName = data?.siteName || hostOf(url);

  const site: ElementContent[] = [];
  if (data?.favicon) {
    site.push(
      element("img", {
        className: ["link-card-favicon"],
        src: data.favicon,
        alt: "",
        width: 16,
        height: 16,
        loading: "lazy",
        decoding: "async",
      }),
    );
  }
  site.push(element("span", {}, [text(siteName)]));

  const body: ElementContent[] = [
    element("div", { className: ["link-card-title"] }, [text(title)]),
  ];
  if (data?.description) {
    body.push(
      element("div", { className: ["link-card-description"] }, [
        text(data.description),
      ]),
    );
  }
  body.push(element("div", { className: ["link-card-site"] }, site));

  const children: ElementContent[] = [
    element("div", { className: ["link-card-text"] }, body),
  ];
  if (data?.image) {
    children.push(
      element("img", {
        className: ["link-card-image"],
        src: data.image,
        alt: "",
        loading: "lazy",
        decoding: "async",
      }),
    );
  }

  return element(
    "a",
    {
      className: data ? ["link-card"] : ["link-card", "link-card-plain"],
      href: url,
      target: "_blank",
      rel: ["noopener", "noreferrer"],
    },
    children,
  );
}

/**
 * Identifies the card data a render used, for the HTML cache key in
 * markdown-rendering.ts.
 */
export function fingerprintCards(cards?: LinkCardMap): string {
  if (!cards) return "";
  return Object.entries(cards)
    .map(([url, card]) => `${url}|${card.status}|${card.fetchedAt}`)
    .join("\u0001");
}

// --- Helpers ---

function element(
  tagName: string,
  properties: Properties,
  children: ElementContent[] = [],
): Element {
  return { type: "element", tagName, properties, children };
}

function text(value: string): Text {
  return { type: "text", value };
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
