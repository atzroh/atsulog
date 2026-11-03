import "server-only";

import { getLinkCardDb } from "@/app/lib/db/db";
import { fetchLinkCard } from "@/app/lib/link-card/link-card-fetch";
import type {
  LinkCard,
  LinkCardMap,
} from "@/app/lib/link-card/link-card-types";

// --- Constants ---

const OK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** A dead link should cost one timeout a day, not one per view. */
const ERROR_TTL_MS = 24 * 60 * 60 * 1000;
/** A failure that may not repeat is worth retrying sooner — but not on every
 *  view, since a host that hangs costs the whole fetch timeout each time. */
const TRANSIENT_TTL_MS = 10 * 60 * 1000;

/** How long a render waits; a slower fetch still lands in the cache. */
const DEADLINE_MS = 3_000;

/** One fetch per URL, shared by every request that wants it. Per process: a
 *  clustered deploy would just fetch the same link once per worker. */
const inFlight = new Map<string, Promise<LinkCard>>();

// --- Public API ---

/**
 * Keyed in the order given, since markdown-rendering.ts fingerprints the result.
 * Stale or missing cards are fetched for up to DEADLINE_MS; the rest render bare
 * and are picked up next request (the server is a long-lived process).
 */
export async function getLinkCards(urls: string[]): Promise<LinkCardMap> {
  if (urls.length === 0) return {};

  const stored = urls.map(readCard);
  const resolved = new Map<string, LinkCard>();
  const pending: Promise<void>[] = [];

  urls.forEach((url, index) => {
    const card = stored[index];
    if (card && isFresh(card)) {
      resolved.set(url, card);
      return;
    }
    // Stale but usable: shown if the refetch does not land in time.
    if (card) resolved.set(url, card);
    pending.push(
      refresh(url).then((fetched) => void resolved.set(url, fetched)),
    );
  });

  if (pending.length > 0) await settleWithin(pending, DEADLINE_MS);

  // A fetch past the deadline keeps running, so snapshot rather than hand out
  // a map that changes under the caller.
  const cards: LinkCardMap = {};
  for (const url of urls) {
    const card = resolved.get(url);
    if (card) cards[url] = card;
  }
  return cards;
}

// --- Fetching ---

function refresh(url: string): Promise<LinkCard> {
  const running = inFlight.get(url);
  if (running) return running;

  const task = fetchLinkCard(url)
    .then((card) => {
      writeCard(card);
      return card;
    })
    .finally(() => inFlight.delete(url));

  inFlight.set(url, task);
  return task;
}

function settleWithin(tasks: Promise<unknown>[], ms: number): Promise<unknown> {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  return Promise.race([Promise.allSettled(tasks), deadline]).finally(() =>
    clearTimeout(timer),
  );
}

// --- Storage ---

function readCard(url: string): LinkCard | null {
  try {
    const row = getLinkCardDb()
      .prepare("SELECT card FROM link_cards WHERE url = ?")
      .get(url) as { card: string } | undefined;
    if (!row) return null;
    const card = JSON.parse(row.card) as LinkCard;
    return card.status === "ok" || card.status === "error" ? card : null;
  } catch (error: unknown) {
    // Losing an entry only costs a fetch, so nothing here is fatal.
    console.error(`Failed to read the link card cache for ${url}`, error);
    return null;
  }
}

function writeCard(card: LinkCard): void {
  try {
    getLinkCardDb()
      .prepare(
        `INSERT INTO link_cards (url, card) VALUES (?, ?)
         ON CONFLICT (url) DO UPDATE SET card = excluded.card`,
      )
      .run(card.url, JSON.stringify(card));
  } catch (error: unknown) {
    console.error(`Failed to cache the link card for ${card.url}`, error);
  }
}

// --- Helpers ---

function isFresh(card: LinkCard): boolean {
  const ttl =
    card.status === "ok"
      ? OK_TTL_MS
      : card.transient
        ? TRANSIENT_TTL_MS
        : ERROR_TTL_MS;
  const age = Date.now() - Date.parse(card.fetchedAt);
  return Number.isFinite(age) && age < ttl;
}
