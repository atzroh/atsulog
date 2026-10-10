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

export type ArticleDetail = {
  metadata: ArticleMetadata;
  content: string;
};

export type SortBy = "created" | "modified" | "views";

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
  category?: string[];
  series?: string[];
};
