export type ArticleMetadata = {
  slug: string;
  title: string;
  createdAt: string;
  modifiedAt: string;
  tags: string[];
  series: string | null;
  seriesOrder: number | null;
  category: string;
  published: boolean;
};

export type ArticleDetail = {
  metadata: ArticleMetadata;
  content: string;
};

/**
 * Which articles a query covers. "public" is what visitors see: published,
 * without the about page.
 */
export type ArticleScope = "public" | "published" | "drafts" | "all";

export type SortBy = "created" | "modified";

export type SortOrder = "asc" | "desc";

/** Search params shared by the article list pages. */
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
 * Autocomplete candidates, as produced by getTaxonomies(). All optional, since
 * a caller may offer suggestions for only some fields.
 */
export type TaxonomyCandidates = {
  tags?: string[];
  categories?: string[];
  series?: string[];
};

/** Sorted unique tags, categories and series. */
export type Taxonomies = Required<TaxonomyCandidates>;

/** One page of search results. */
export type ArticlePage = {
  items: ArticleMetadata[];
  currentPage: number;
  totalPages: number;
  /** Matches across every page. */
  totalCount: number;
};

/** The published neighbours of an article within its series. */
export type SeriesNeighbors = {
  series: string;
  previous: ArticleMetadata | null;
  next: ArticleMetadata | null;
};

/** A category with the number of articles in it. */
export type CategoryCount = {
  category: string;
  count: number;
};

/** A tag with the number of articles carrying it. */
export type TagCount = {
  tag: string;
  count: number;
};
