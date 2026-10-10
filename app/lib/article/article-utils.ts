import { siteConfig } from "@/app/lib/site-config";
import type {
  ArticleMetadata,
  ArticleSearchParams,
  SortBy,
  SortOrder,
} from "@/app/lib/article/article-types";

/** The first value of a search parameter. */
export function getParam(
  param: string | string[] | undefined,
  defaultValue: string = "",
): string {
  if (Array.isArray(param)) return param[0] ?? defaultValue;
  return param ?? defaultValue;
}

/** Reads the fields shared by the create and edit forms. */
export function parseArticleForm(formData: FormData) {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  return {
    title: raw.title,
    category: raw.category,
    series: raw.series.trim() || null,
    tags: raw.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    content: raw.content,
    isPublished: raw.intent === "publish",
  };
}

/**
 * siteConfig.timeZone rather than the host's, so a slug is the same locally and
 * on the server. The locale only supplies latin digits; field order is set below.
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

/** Concatenates the requested wall-clock fields, zero-padded. */
function formatZoned(
  date: Date,
  fields: readonly Intl.DateTimeFormatPartTypes[],
): string {
  const values = new Map(
    zonedFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return fields.map((field) => values.get(field) ?? "").join("");
}

/** YYYYMMDD. */
export function formatDateCompact(date: Date = new Date()): string {
  return formatZoned(date, ["year", "month", "day"]);
}

/** YYYYMMDDHHMMSS, given to a draft when it is published. */
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
 * Collapses everything outside [a-z0-9._-] into "-", so the stem cannot end a
 * Markdown link destination early. Empty when nothing usable remains.
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

/** Defaults to createdAt descending, or seriesOrder ascending within a series. */
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

  // Modified and views are always descending; a series reads oldest first.
  const order =
    field === "modifiedAt" || field === "viewCount"
      ? "desc"
      : orderParam || (hasSeries ? "asc" : "desc");

  return { field, order, sortBy };
}

export function sortArticles(
  articles: ArticleMetadata[],
  field: keyof ArticleMetadata = "createdAt",
  order: SortOrder = "desc",
): ArticleMetadata[] {
  const isAsc = order === "asc";
  return [...articles].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    if (field === "createdAt" || field === "modifiedAt") {
      aVal = Date.parse(aVal as string);
      bVal = Date.parse(bVal as string);
    }

    // Missing values go last in either order.
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal === bVal) return 0;
    const comparison = aVal < bVal ? -1 : 1;
    return isAsc ? comparison : -comparison;
  });
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString(siteConfig.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: siteConfig.timeZone,
  });
}

/**
 * Sorted unique tags, categories and series, plus launchedAt (the oldest
 * createdAt) and the total view count.
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
    if (query) {
      const matches =
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.series?.toLowerCase().includes(query) ||
        article.tags.some((t) => t.toLowerCase().includes(query));
      if (!matches) return false;
    }

    // Comma-separated; an article must carry every tag.
    if (tag) {
      const searchTags = tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const articleTags = article.tags.map((t) => t.toLowerCase());
      if (!searchTags.every((st) => articleTags.includes(st))) return false;
    }

    if (series && article.series?.toLowerCase() !== series) return false;
    if (category && article.category.toLowerCase() !== category) return false;

    return true;
  });
}

/** Existing params with `updates` applied; null or undefined removes a key. */
export function buildArticleSearchUrl(
  basePath: string,
  searchParams: ArticleSearchParams,
  updates: Record<string, string | number | null | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
  });

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
