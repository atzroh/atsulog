import { siteConfig } from "@/app/lib/site-config";
import type {
  ArticleMetadata,
  ArticleSearchParams,
  SortBy,
  SortOrder,
} from "@/app/lib/article/article-types";

/**
 * Extracts the first string value from a search parameter.
 */
export function getParam(
  param: string | string[] | undefined,
  defaultValue: string = "",
): string {
  if (Array.isArray(param)) return param[0] ?? defaultValue;
  return param ?? defaultValue;
}

/**
 * Reads wall-clock fields in siteConfig.timeZone rather than the host's, so a
 * slug is the same whether it is generated locally or on the server. The
 * locale only carries latin digits here — the field order is imposed below.
 */
const zonedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/**
 * Concatenates the requested wall-clock fields of a date, zero-padded.
 */
function formatZoned(
  date: Date,
  fields: readonly Intl.DateTimeFormatPartTypes[],
): string {
  const values = new Map(
    zonedFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return fields.map((field) => values.get(field) ?? "").join("");
}

/**
 * Formats a date into a compact YYYYMMDD string.
 */
export function formatDateCompact(date: Date = new Date()): string {
  return formatZoned(date, ["year", "month", "day"]);
}

/**
 * Generates a timestamp-based slug from the current date (YYYYMMDDHHMMSS).
 * Used for transitioning articles from draft to published.
 */
export function generateSlug(date: Date = new Date()): string {
  return formatZoned(date, [
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
  ]);
}

/** Upper bound for a sanitized stem, leaving room for a suffix and extension. */
const MAX_FILENAME_STEM_LENGTH = 100;

/**
 * Normalizes a file name stem so it is safe inside a Markdown image URL.
 * Everything outside [a-z0-9._-] — spaces, symbols and non-ASCII alike —
 * collapses into "-", which keeps the URL free of characters that would
 * terminate a Markdown link destination early.
 * Returns an empty string when nothing usable remains, so the caller can
 * fall back to a generated name.
 */
export function sanitizeFileName(stem: string): string {
  return stem
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, MAX_FILENAME_STEM_LENGTH)
    .replace(/[-.]+$/g, "");
}

/**
 * Calculates the sorting configuration based on search parameters.
 * Defaults to "createdAt" descending, or "seriesOrder" ascending if a series is selected.
 */
export function getSortConfig(params: ArticleSearchParams): {
  field: keyof ArticleMetadata;
  order: SortOrder;
  sortBy: SortBy;
} {
  const sortByParam = getParam(params.sortBy) as SortBy;
  const orderParam = getParam(params.order) as SortOrder;
  const hasSeries = !!getParam(params.series);

  const configMap: Record<
    string,
    { field: keyof ArticleMetadata; sortBy: SortBy }
  > = {
    modified: { field: "modifiedAt", sortBy: "modified" },
    views: { field: "viewCount", sortBy: "views" },
  };

  const { field, sortBy } = configMap[sortByParam] ?? {
    field: hasSeries && !sortByParam ? "seriesOrder" : "createdAt",
    sortBy: "created",
  };

  // Determine sort order
  // - Modified and Views always default to descending
  // - Series filtering defaults to ascending (oldest first)
  // - Otherwise, default to descending (newest first)
  const order =
    field === "modifiedAt" || field === "viewCount"
      ? "desc"
      : orderParam || (hasSeries ? "asc" : "desc");

  return { field, order, sortBy };
}

/**
 * Sorts an array of article metadata.
 * Supports dates, numbers, and string-based fields.
 */
export function sortArticles(
  articles: ArticleMetadata[],
  field: keyof ArticleMetadata = "createdAt",
  order: SortOrder = "desc",
): ArticleMetadata[] {
  const isAsc = order === "asc";
  return [...articles].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle date strings
    if (field === "createdAt" || field === "modifiedAt") {
      aVal = Date.parse(aVal as string);
      bVal = Date.parse(bVal as string);
    }

    // Handle null/undefined values (push to the end)
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal === bVal) return 0;
    const comparison = aVal < bVal ? -1 : 1;
    return isAsc ? comparison : -comparison;
  });
}

/**
 * Formats an ISO date string into a localized, user-friendly format.
 */
export function formatDate(value: string): string {
  return new Date(value).toLocaleString(siteConfig.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: siteConfig.timeZone,
  });
}

/**
 * Extracts unique taxonomy values (tags, categories, series) and the oldest creation date (launchedAt) from a list of articles.
 */
export function getTaxonomies(articles: ArticleMetadata[]) {
  const tagsSet = new Set<string>();
  const categorySet = new Set<string>();
  const seriesSet = new Set<string>();
  let oldestDate: Date | null = null;
  let launchedAt: string | null = null;
  let totalViews = 0;

  for (const article of articles) {
    article.tags.forEach((t) => tagsSet.add(t));
    categorySet.add(article.category);
    if (article.series) seriesSet.add(article.series);
    totalViews += article.viewCount;

    const createdAt = new Date(article.createdAt);
    if (!oldestDate || createdAt < oldestDate) {
      oldestDate = createdAt;
      launchedAt = article.createdAt;
    }
  }

  return {
    tags: Array.from(tagsSet).sort(),
    category: Array.from(categorySet).sort(),
    series: Array.from(seriesSet).sort(),
    launchedAt,
    totalViews,
  };
}

/**
 * Determines the next seriesOrder index for a new article in a given series.
 */
export function getNextSeriesOrder(
  seriesName: string,
  articles: ArticleMetadata[],
): number {
  const seriesArticles = articles.filter(
    (article) => article.series === seriesName,
  );
  const maxOrder = seriesArticles.reduce(
    (max, a) => Math.max(max, a.seriesOrder ?? -1),
    -1,
  );
  return maxOrder + 1;
}

/**
 * Filters article metadata based on the provided search parameters.
 */
export function filterArticles(
  articles: ArticleMetadata[],
  params: ArticleSearchParams,
): ArticleMetadata[] {
  const query = getParam(params.keyword).toLowerCase();
  const tag = getParam(params.tag).toLowerCase();
  const series = getParam(params.series).toLowerCase();
  const category = getParam(params.category).toLowerCase();

  if (!query && !tag && !series && !category) {
    return articles;
  }

  return articles.filter((article) => {
    // Keyword search across multiple fields
    if (query) {
      const matches =
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.series?.toLowerCase().includes(query) ||
        article.tags.some((t) => t.toLowerCase().includes(query));
      if (!matches) return false;
    }

    // Tag filtering (supports comma-separated tags)
    if (tag) {
      const searchTags = tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const articleTags = article.tags.map((t) => t.toLowerCase());
      if (!searchTags.every((st) => articleTags.includes(st))) return false;
    }

    // Series and Category filtering
    if (series && article.series?.toLowerCase() !== series) return false;
    if (category && article.category.toLowerCase() !== category) return false;

    return true;
  });
}

/**
 * Constructs a URL with article search parameters, preserving existing ones.
 */
export function buildArticleSearchUrl(
  basePath: string,
  searchParams: ArticleSearchParams,
  updates: Record<string, string | number | null | undefined>,
): string {
  const params = new URLSearchParams();

  // 1. Copy existing params
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
  });

  // 2. Apply updates
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
