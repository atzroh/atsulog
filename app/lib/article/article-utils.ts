import type {
  ArticleMetadata,
  ArticleSearchParams,
  SortBy,
  SortOrder,
} from "@/app/lib/article/article-types";
import { formatDateTimeCompact } from "@/app/lib/date-format";

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

type ArticleForm = ReturnType<typeof parseArticleForm>;

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

  const configMap: Record<
    string,
    { field: keyof ArticleMetadata; sortBy: SortBy }
  > = {
    modified: { field: "modifiedAt", sortBy: "modified" },
  };

  const { field, sortBy } = configMap[sortByParam] ?? {
    field: hasSeries && !sortByParam ? "seriesOrder" : "createdAt",
    sortBy: "created",
  };

  // Modified is always descending; a series reads oldest first.
  const order =
    field === "modifiedAt"
      ? "desc"
      : orderParam || (hasSeries ? "asc" : "desc");

  return { field, order, sortBy };
}

/** The articles matching `params`, in the order they ask for. */
export function searchArticles(
  articles: ArticleMetadata[],
  params: ArticleSearchParams,
): ArticleMetadata[] {
  const { field, order } = getSortConfig(params);
  return sortArticles(filterArticles(articles, params), field, order);
}

/** The page `pageParam` asks for, clamped to the pages there are (at least one). */
export function paginate<T>(
  items: T[],
  pageParam: string | string[] | undefined,
  perPage: number,
): { pageItems: T[]; currentPage: number; totalPages: number } {
  const rawPage = Number.parseInt(getParam(pageParam, "1"), 10);
  const requestedPage = rawPage > 0 ? rawPage : 1;

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * perPage;

  return {
    pageItems: items.slice(startIndex, startIndex + perPage),
    currentPage,
    totalPages,
  };
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

/**
 * Sorted unique tags, categories and series, plus launchedAt (the oldest
 * createdAt).
 */
export function getTaxonomies(articles: ArticleMetadata[]) {
  const tagsSet = new Set<string>();
  const categorySet = new Set<string>();
  const seriesSet = new Set<string>();
  let oldestDate: Date | null = null;
  let launchedAt: string | null = null;

  for (const article of articles) {
    article.tags.forEach((t) => tagsSet.add(t));
    categorySet.add(article.category);
    if (article.series) seriesSet.add(article.series);

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
