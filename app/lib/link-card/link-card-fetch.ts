import "server-only";

import { decodeNamedCharacterReference } from "decode-named-character-reference";

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

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);
const YOUTUBE_OEMBED = "https://www.youtube.com/oembed";
const YOUTUBE_FAVICON = "https://www.youtube.com/favicon.ico";

const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

// --- Public API ---

/**
 * Reads one link's Open Graph data. Never throws: a failure becomes an
 * "error" card, which the store keeps so the next render does not retry.
 */
export async function fetchLinkCard(url: string): Promise<LinkCard> {
  if (isPrivateHost(url)) return errorCard(url);

  // No falling back to the page: a YouTube URL oEmbed will not describe is
  // one the page answers with "- YouTube" and its generic blurb, which on a
  // card reads worse than the URL itself.
  if (isYouTube(url)) return fetchYouTubeCard(url);

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
      // A page that is not HTML will not be HTML tomorrow either; a 503 might.
      return errorCard(url, response.ok ? false : isTransientStatus(response.status));
    }

    const bytes = await readHead(response);
    // Redirects move the base every relative URL resolves against.
    return parseCard(url, decode(bytes, contentType), response.url);
  } catch {
    // A timeout, a refused connection, a DNS miss — all worth trying again.
    return errorCard(url, true);
  }
}

/** Worth another go: the server is struggling or is asking us to slow down. */
function isTransientStatus(status: number): boolean {
  return status >= 500 || status === 408 || status === 429;
}

// --- Fetching ---

function isYouTube(url: string): boolean {
  try {
    return YOUTUBE_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * YouTube answers some callers with a stripped page — no og:image, and a
 * title of just "- YouTube" — and which callers seems to go by address, so it
 * reads fine here and not from the server. Its oEmbed endpoint has no such
 * mood, and costs 1KB where the page costs 780KB.
 *
 * Covers videos, shorts and playlists. Returns null for the rest — a channel
 * page, or a video that is gone.
 */
async function fetchYouTubeCard(url: string): Promise<LinkCard> {
  const endpoint = `${YOUTUBE_OEMBED}?url=${encodeURIComponent(url)}&format=json`;

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    const json = /^\s*application\/json/i.test(
      response.headers.get("content-type") ?? "",
    );
    if (!response.ok || !json) {
      await response.body?.cancel();
      // 400 and 404 are oEmbed saying it does not cover this URL.
      return errorCard(url, isTransientStatus(response.status));
    }

    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return errorCard(url);
    const { title, author_name, thumbnail_url } = data as Record<string, unknown>;

    const name = clean(typeof title === "string" ? title : undefined, MAX_TITLE);
    if (!name) return errorCard(url);

    return {
      url,
      status: "ok",
      fetchedAt: new Date().toISOString(),
      title: name,
      // The channel, which is what a viewer wants from a video alongside it.
      description: clean(
        typeof author_name === "string" ? author_name : undefined,
        MAX_DESCRIPTION,
      ),
      siteName: "YouTube",
      image: httpsUrl(
        typeof thumbnail_url === "string" ? thumbnail_url : undefined,
        endpoint,
      ),
      favicon: YOUTUBE_FAVICON,
    };
  } catch {
    return errorCard(url, true);
  }
}

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

/**
 * The output is re-escaped on render, so an undecoded `&amp;` shows through.
 * Named references go through the full HTML5 table — a title carrying
 * `&mdash;` is not rare, and they are case sensitive.
 */
function decodeEntities(value: string): string {
  return value.replace(
    /&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (match, body: string) => {
      if (body.startsWith("#")) {
        const hex = body[1] === "x" || body[1] === "X";
        const digits = body.slice(hex ? 2 : 1);
        return codePoint(parseInt(digits, hex ? 16 : 10)) ?? match;
      }
      return decodeNamedCharacterReference(body) || match;
    },
  );
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

function errorCard(url: string, transient = false): LinkCard {
  return {
    url,
    status: "error",
    fetchedAt: new Date().toISOString(),
    ...(transient && { transient }),
  };
}
