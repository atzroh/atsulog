import "server-only";

import type { LinkCard } from "@/app/lib/link-card/link-card-types";
import { siteConfig } from "@/app/lib/site-config";

// --- Constants ---

const FETCH_TIMEOUT_MS = 5_000;
/** YouTube's <head> runs to 780KB. Reading stops at `</head>`, so no ordinary
 *  site (55KB at the worst measured) ever reaches this. */
const MAX_HTML_BYTES = 1024 * 1024;
const MAX_TITLE = 200;
const MAX_DESCRIPTION = 300;

const USER_AGENT = `Mozilla/5.0 (compatible; AtsulogBot/1.0; +${siteConfig.url}/)`;

/** Byte-per-char, so an ASCII tag matches whatever the real encoding is, and
 *  no character is ever split across a chunk. */
const LATIN1 = new TextDecoder("latin1");
const UTF8 = new TextDecoder("utf-8");

// Negated character classes only: the input is attacker-shaped, if only by
// accident, and a nested quantifier here would be a stall waiting to happen.
const META_TAG = /<meta\s[^>]*>/gi;
const LINK_TAG = /<link\s[^>]*>/gi;
const ATTRIBUTE = /([a-zA-Z:-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g;
const TITLE_TAG = /<title[^>]*>([^<]*)<\/title>/i;
const HEAD_END = /<\/head|<body/i;
/** Both of the tags above are shorter, so neither is lost at a chunk border. */
const CARRY = 8;
const CHARSET = /charset\s*=\s*["']?([\w-]+)/i;

const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

// --- Public API ---

/**
 * Reads one link's Open Graph data. Never throws: a failure becomes an
 * "error" card, which the store keeps so the next render does not retry.
 */
export async function fetchLinkCard(url: string): Promise<LinkCard> {
  if (isPrivateHost(url)) return errorCard(url);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.8,en;q=0.5",
      },
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok || !isHtml(contentType)) {
      await response.body?.cancel();
      return errorCard(url);
    }

    const bytes = await readHead(response);
    // Redirects move the base every relative URL resolves against.
    return parseCard(url, decode(bytes, contentType), response.url);
  } catch {
    return errorCard(url);
  }
}

// --- Fetching ---

function isHtml(contentType: string | null): boolean {
  return /^\s*(text\/html|application\/xhtml\+xml)/i.test(contentType ?? "");
}

/** Reads at most MAX_HTML_BYTES, and stops as soon as the head is in hand. */
async function readHead(response: Response): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();

  const chunks: Uint8Array[] = [];
  let size = 0;
  // Only the new chunk is scanned; rescanning the whole body each time costs
  // 245 passes over a growing string on a page the size of YouTube's.
  let carry = "";

  try {
    while (size < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      size += value.length;

      const text = carry + LATIN1.decode(value);
      if (HEAD_END.test(text)) break;
      carry = text.slice(-CARRY);
    }
  } finally {
    void reader.cancel().catch(() => {});
  }

  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

/** Content-Type, then <meta charset>, then utf-8. */
function decode(bytes: Uint8Array, contentType: string | null): string {
  const label =
    CHARSET.exec(contentType ?? "")?.[1] ??
    CHARSET.exec(LATIN1.decode(bytes.subarray(0, 1024)))?.[1];

  if (label && !/^utf-?8$/i.test(label)) {
    try {
      return new TextDecoder(label).decode(bytes);
    } catch {
      // A small-icu build knows utf-8 alone.
    }
  }
  return UTF8.decode(bytes);
}

// --- Parsing ---

function parseCard(url: string, html: string, finalUrl: string): LinkCard {
  const head = headOf(html);
  const meta = metaOf(head);

  return {
    url,
    status: "ok",
    fetchedAt: new Date().toISOString(),
    title: clean(
      meta.get("og:title") ?? meta.get("twitter:title") ?? titleOf(head),
      MAX_TITLE,
    ),
    description: clean(
      meta.get("og:description") ??
        meta.get("twitter:description") ??
        meta.get("description"),
      MAX_DESCRIPTION,
    ),
    siteName: clean(meta.get("og:site_name"), MAX_TITLE),
    image: httpsUrl(
      meta.get("og:image") ?? meta.get("og:image:url") ?? meta.get("twitter:image"),
      finalUrl,
    ),
    favicon: faviconOf(head, finalUrl),
  };
}

/** Everything a card needs is in the head. */
function headOf(html: string): string {
  const end = html.search(/<\/head|<body/i);
  return end === -1 ? html : html.slice(0, end);
}

/** Attribute order and quoting differ per site, so each tag is parsed on its own. */
function metaOf(head: string): Map<string, string> {
  const meta = new Map<string, string>();

  for (const [tag] of head.matchAll(META_TAG)) {
    const attributes = attributesOf(tag);
    // Open Graph uses property=, Twitter Cards use name=.
    const key = (
      attributes.get("property") ?? attributes.get("name")
    )?.toLowerCase();
    const content = attributes.get("content");
    if (key && content && !meta.has(key)) meta.set(key, content);
  }
  return meta;
}

function attributesOf(tag: string): Map<string, string> {
  const attributes = new Map<string, string>();
  for (const [, name, raw] of tag.matchAll(ATTRIBUTE)) {
    attributes.set(name.toLowerCase(), decodeEntities(unquote(raw)));
  }
  return attributes;
}

function unquote(value: string): string {
  const quoted = value.startsWith('"') || value.startsWith("'");
  return quoted ? value.slice(1, -1) : value;
}

function titleOf(head: string): string | undefined {
  const title = TITLE_TAG.exec(head)?.[1];
  return title === undefined ? undefined : decodeEntities(title);
}

/**
 * The icon the page declares, `rel="icon"` ahead of the rest. An
 * apple-touch-icon is a home-screen tile, and X serves its under
 * `Cross-Origin-Resource-Policy: same-origin` — reachable from here, but a
 * browser refuses to draw it on another site, which is a broken image.
 *
 * Only a declared icon: guessing /favicon.ico draws a broken image on every
 * site that has none, and the card has no script to hide one with.
 */
function faviconOf(head: string, finalUrl: string): string | undefined {
  const fallbacks: string[] = [];

  for (const [tag] of head.matchAll(LINK_TAG)) {
    const attributes = attributesOf(tag);
    const rel = (attributes.get("rel") ?? "").toLowerCase().split(/\s+/);
    if (!rel.some((token) => token.includes("icon"))) continue;

    // A page may declare a `data:` icon, which is no use to us.
    const href = httpsUrl(attributes.get("href"), finalUrl);
    if (!href) continue;
    if (rel.includes("icon")) return href;
    fallbacks.push(href);
  }
  return fallbacks[0];
}

// --- Helpers ---

/** The output is re-escaped on render, so an undecoded `&amp;` would show through. */
function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    const lower = body.toLowerCase();
    if (lower.startsWith("#x")) return codePoint(parseInt(lower.slice(2), 16)) ?? match;
    if (lower.startsWith("#")) return codePoint(parseInt(lower.slice(1), 10)) ?? match;
    return ENTITIES[lower] ?? match;
  });
}

function codePoint(value: number): string | undefined {
  if (!Number.isInteger(value) || value < 0 || value > 0x10ffff) return undefined;
  try {
    return String.fromCodePoint(value);
  } catch {
    return undefined;
  }
}

function clean(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.length > max ? text.slice(0, max) : text;
}

/** An http image is blocked as mixed content, so it is no use to us. */
function httpsUrl(value: string | undefined, base: string): string | undefined {
  if (!value) return undefined;
  try {
    const resolved = new URL(value, base);
    return resolved.protocol === "https:" ? resolved.href : undefined;
  } catch {
    return undefined;
  }
}

function isPrivateHost(url: string): boolean {
  try {
    return PRIVATE_HOST.test(new URL(url).hostname);
  } catch {
    return true;
  }
}

function errorCard(url: string): LinkCard {
  return { url, status: "error", fetchedAt: new Date().toISOString() };
}
