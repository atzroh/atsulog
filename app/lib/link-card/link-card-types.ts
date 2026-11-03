/** One link's Open Graph data, cached in data/link-cards.db. */
export type LinkCard = {
  url: string;
  /** "error" is a negative cache entry: a dead link must not cost a fetch twice. */
  status: "ok" | "error";
  /** The failure may not repeat — a timeout, a refused connection, a 5xx — so
   *  the entry expires in minutes rather than in a day. */
  transient?: boolean;
  /** ISO 8601. */
  fetchedAt: string;
  title?: string;
  description?: string;
  siteName?: string;
  /** https only: an http image is blocked as mixed content. */
  image?: string;
  favicon?: string;
};

/** Cards keyed by the URL they were built from. */
export type LinkCardMap = Record<string, LinkCard>;
