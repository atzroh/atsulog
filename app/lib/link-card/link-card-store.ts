import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { fetchLinkCard } from "@/app/lib/link-card/link-card-fetch";
import type {
  LinkCard,
  LinkCardMap,
} from "@/app/lib/link-card/link-card-types";

// --- Constants ---

const PROJECT_ROOT = process.cwd();
const LINK_CARDS_DIR = path.join(PROJECT_ROOT, "data", "link-cards");

const OK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** A dead link should cost one timeout a day, not one per view. */
const ERROR_TTL_MS = 24 * 60 * 60 * 1000;

/** How long a render waits; a slower fetch still lands in the cache. */
const DEADLINE_MS = 3_000;

/** One fetch per URL, shared by every request that wants it. Per process: a
 *  clustered deploy would just fetch the same link once per worker. */
const inFlight = new Map<string, Promise<LinkCard>>();

// --- Public API ---

/**
 * The cards for these URLs, keyed in the order given — markdown-rendering.ts
 * fingerprints the result, so the order is part of the contract.
 *
 * Fresh entries come from disk; missing or expired ones are fetched, but only
 * DEADLINE_MS is spent waiting. The rest render bare and are picked up by the
 * next request, which holds only because the server is a long-lived process.
 */
export async function getLinkCards(urls: string[]): Promise<LinkCardMap> {
  if (urls.length === 0) return {};

  const stored = await Promise.all(urls.map(readCard));
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
    pending.push(refresh(url).then((fetched) => void resolved.set(url, fetched)));
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
    .then(async (card) => {
      await writeCard(card);
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

async function readCard(url: string): Promise<LinkCard | null> {
  try {
    const content = await readFile(filePathFor(url), "utf8");
    const card = JSON.parse(content) as LinkCard;
    return card.status === "ok" || card.status === "error" ? card : null;
  } catch (error: unknown) {
    // Losing an entry only costs a fetch, so nothing here is fatal.
    if (!isNotFound(error)) {
      console.error(`Failed to read the link card cache for ${url}`, error);
    }
    return null;
  }
}

async function writeCard(card: LinkCard): Promise<void> {
  const filePath = filePathFor(card.url);
  // The article page reads these on every request, so never leave a torn file.
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  try {
    await mkdir(LINK_CARDS_DIR, { recursive: true });
    await writeFile(temporaryPath, `${JSON.stringify(card, null, 2)}\n`, "utf8");
    await rename(temporaryPath, filePath);
  } catch (error: unknown) {
    console.error(`Failed to cache the link card for ${card.url}`, error);
  }
}

// --- Helpers ---

function isFresh(card: LinkCard): boolean {
  const ttl = card.status === "ok" ? OK_TTL_MS : ERROR_TTL_MS;
  const age = Date.now() - Date.parse(card.fetchedAt);
  return Number.isFinite(age) && age < ttl;
}

/** A URL is no file name, and a hash keeps one entry per link. */
function filePathFor(url: string): string {
  const name = createHash("sha256").update(url).digest("hex").slice(0, 16);
  return path.join(LINK_CARDS_DIR, `${name}.json`);
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
