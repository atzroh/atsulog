/** One link's Open Graph data, cached as data/link-cards/<hash>.json. */
export type LinkCard = {
  /** The file name is a hash, so the URL is kept here. */
  url: string;
  /** "error" is a negative cache entry: a dead link must not cost a fetch twice. */
  status: "ok" | "error";
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
