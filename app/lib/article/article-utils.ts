import type {
  ArticleMetadata,
  ArticleSearchParams,
  SortBy,
  SortOrder,
} from "@/app/lib/article/article-types";
import { formatDateTimeCompact } from "@/app/lib/date-format";

type ArticleForm = ReturnType<typeof parseArticleForm>;

/** The first value of a search parameter. */
export function getParam(
  param: string | string[] | undefined,
  defaultValue: string = "",
): string {
  if (Array.isArray(param)) return param[0] ?? defaultValue;
  return param ?? defaultValue;
}

/** Comma-separated tags, trimmed, without empties. */
export function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Reads the fields shared by the create and edit forms. */
export function parseArticleForm(formData: FormData) {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  return {
    title: raw.title,
    category: raw.category,
    series: raw.series.trim() || null,
    tags: splitTags(raw.tags),
    content: raw.content,
    isPublished: raw.intent === "publish",
  };
}

/** A new article from the form, created at `now`. */
export function buildNewArticle(
  form: Omit<ArticleForm, "content">,
  now: Date,
): ArticleMetadata {
  const timestamp = formatDateTimeCompact(now);
  const createdAt = now.toISOString();

  return {
    slug: form.isPublished ? timestamp : `draft-${timestamp}`,
    title: form.title,
    category: form.category,
    series: form.series,
    seriesOrder: null,
    tags: form.tags,
    createdAt,
    modifiedAt: createdAt,
    published: form.isPublished,
  };
}

/** `existing` with the form applied; a published article never reverts to a draft. */
export function applyArticleEdit(
  existing: ArticleMetadata,
  form: Omit<ArticleForm, "content">,
  now: Date,
): ArticleMetadata {
  return {
    ...existing,
    title: form.title,
    category: form.category,
    series: form.series,
    tags: form.tags,
    modifiedAt: now.toISOString(),
    published: existing.published || form.isPublished,
  };
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

  const sortBy: SortBy = sortByParam === "modified" ? "modified" : "created";
  const field: keyof ArticleMetadata =
    sortBy === "modified"
      ? "modifiedAt"
      : hasSeries && !sortByParam
        ? "seriesOrder"
        : "createdAt";

  // Modified is always descending; a series reads oldest first.
  const order =
    field === "modifiedAt"
      ? "desc"
      : orderParam || (hasSeries ? "asc" : "desc");

  return { field, order, sortBy };
}

/** The page `pageParam` asks for, clamped to the pages there are (at least one). */
export function resolvePage(
  pageParam: string | string[] | undefined,
  total: number,
  perPage: number,
): { currentPage: number; totalPages: number } {
  const rawPage = Number.parseInt(getParam(pageParam, "1"), 10);
  const requestedPage = rawPage > 0 ? rawPage : 1;

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return { currentPage: Math.min(requestedPage, totalPages), totalPages };
}

/**
 * Editor defaults for an article joining `series`, taken from its latest
 * article. Only fields still empty (or auto-filled) are returned.
 */
export function suggestSeriesDefaults(
  series: string,
  articles: ArticleMetadata[],
  current: { title: string; category: string; tags: string },
): { title?: string; category?: string; tags?: string } {
  const previous = articles
    .filter((article) => article.series === series)
    .sort((a, b) => (b.seriesOrder ?? 0) - (a.seriesOrder ?? 0))[0];
  const suggestion: { title?: string; category?: string; tags?: string } = {};

  if (current.title.trim() === "" || /#\d{3}$/.test(current.title)) {
    const order = previous ? (previous.seriesOrder ?? 0) + 1 : 0;
    suggestion.title = `${series}#${String(order).padStart(3, "0")}`;
  }

  if (previous) {
    if (current.category === "" || current.category === "General") {
      suggestion.category = previous.category;
    }
    if (current.tags.trim() === "") {
      suggestion.tags = previous.tags.join(", ");
    }
  }
  return suggestion;
}

/** A list page filtered to one tag, category or series. */
export function taxonomyHref(
  basePath: string,
  key: "tag" | "category" | "series",
  value: string,
): string {
  return `${basePath}?${key}=${encodeURIComponent(value)}`;
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
