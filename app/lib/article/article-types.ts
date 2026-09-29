/**
 * Core metadata for an article.
 */
export type ArticleMetadata = {
  slug: string;
  title: string;
  filePath: string;
  createdAt: string;
  modifiedAt: string;
  tags: string[];
  series: string | null;
  seriesOrder: number | null;
  category: string;
  viewCount: number;
  published: boolean;
};

/**
 * Full details of an article, including its content.
 */
export type ArticleDetail = {
  metadata: ArticleMetadata;
  content: string;
};

/**
 * Valid sort keys for articles.
 */
export type SortBy = "created" | "modified" | "views";

/**
 * Valid sort orders.
 */
export type SortOrder = "asc" | "desc";

/**
 * Standard search parameters used across article list pages.
 */
export type ArticleSearchParams = {
  page?: string | string[];
  keyword?: string | string[];
  tag?: string | string[];
  series?: string | string[];
  category?: string | string[];
  sortBy?: string | string[];
  order?: string | string[];
};

/**
 * Autocomplete candidates for the taxonomy fields, as produced by
 * getTaxonomies(). Every field is optional because a caller may offer
 * suggestions for only some of them.
 */
export type TaxonomyCandidates = {
  tags?: string[];
  category?: string[];
  series?: string[];
};

/**
 * Standard props for pages that handle article search parameters.
 */
export type ArticlePageProps = {
  params?: Promise<unknown>;
  searchParams: Promise<ArticleSearchParams>;
};

/**
 * Raw search parameters from Next.js (Legacy/Generic).
 */
export type RawSearchParams = Record<string, string | string[] | undefined>;
