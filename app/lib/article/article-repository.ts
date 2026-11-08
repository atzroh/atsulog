import "server-only";

import type { DatabaseSync, SQLInputValue } from "node:sqlite";

import { connection } from "next/server";

import type {
  ArticleDetail,
  ArticleMetadata,
  ArticlePage,
  ArticleScope,
  ArticleSearchParams,
  SeriesNeighbors,
  Taxonomies,
} from "@/app/lib/article/article-types";
import {
  getParam,
  getSortConfig,
  resolvePage,
  splitTags,
} from "@/app/lib/article/article-utils";
import { formatDateTimeCompact } from "@/app/lib/date-format";
import { getArticleDb, transaction } from "@/app/lib/db/db";
import { siteConfig } from "@/app/lib/site-config";

// --- Types ---

type ArticleRow = {
  slug: string;
  title: string;
  category: string;
  series: string | null;
  series_order: number | null;
  tags: string;
  created_at: string;
  modified_at: string;
  published: number;
};

type DetailRow = ArticleRow & { content: string };

/** A WHERE clause and its positional parameters. */
type Condition = { sql: string; params: SQLInputValue[] };

// --- Constants ---

const ARTICLE_COLUMNS = `slug, title, category, series, series_order,
  created_at, modified_at, published`;

/** Tags come back as a JSON array, in name order. */
const selectFrom = (extraColumns: string = "") =>
  `SELECT a.slug, a.title, a.category, a.series, a.series_order,
    a.created_at, a.modified_at, a.published,
    (SELECT json_group_array(tag ORDER BY tag) FROM article_tags t
      WHERE t.slug = a.slug) AS tags${extraColumns}
  FROM articles a`;

const SELECT_METADATA = selectFrom();
const SELECT_DETAIL = selectFrom(", a.content");

const SORT_COLUMNS: Partial<Record<keyof ArticleMetadata, string>> = {
  createdAt: "a.created_at",
  modifiedAt: "a.modified_at",
  seriesOrder: "a.series_order",
};

// --- Public API ---

/** Every article, drafts included; for the editor's suggestions. */
export async function getArticles(): Promise<ArticleMetadata[]> {
  // Request time only: a build that opened the database would create it.
  await connection();
  return selectMetadata(getArticleDb(), scopeCondition("all"));
}

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  await connection();
  const row = getArticleDb()
    .prepare(`${SELECT_DETAIL} WHERE a.slug = ?`)
    .get(slug) as DetailRow | undefined;
  return row ? toDetail(row) : null;
}

/**
 * The articles in `scope` matching `params`, in the order they ask for.
 * Without `perPage`, every match comes back as a single page.
 */
export async function searchArticles(
  params: ArticleSearchParams,
  scope: ArticleScope,
  perPage?: number,
): Promise<ArticlePage> {
  await connection();
  const db = getArticleDb();
  const where = combine([scopeCondition(scope), ...searchConditions(params)]);
  const orderBy = orderClause(params);

  if (perPage === undefined) {
    const items = selectMetadata(db, where, orderBy);
    return { items, currentPage: 1, totalPages: 1 };
  }

  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM articles a WHERE ${where.sql}`)
    .get(...where.params) as { total: number };
  const { currentPage, totalPages } = resolvePage(params.page, total, perPage);

  const items = selectMetadata(
    db,
    where,
    `${orderBy} LIMIT ${perPage} OFFSET ${(currentPage - 1) * perPage}`,
  );
  return { items, currentPage, totalPages };
}

/** The newest public articles with their content, for the feed. */
export async function getLatestArticleDetails(
  limit: number,
): Promise<ArticleDetail[]> {
  await connection();
  const where = scopeCondition("public");
  const rows = getArticleDb()
    .prepare(
      `${SELECT_DETAIL} WHERE ${where.sql}
       ORDER BY a.created_at DESC LIMIT ${limit}`,
    )
    .all(...where.params) as DetailRow[];
  return rows.map(toDetail);
}

/** Every article's body, drafts included; for finding unused images. */
export async function getArticleContents(): Promise<
  { slug: string; title: string; content: string }[]
> {
  await connection();
  const rows = getArticleDb()
    .prepare("SELECT slug, title, content FROM articles")
    .all() as { slug: string; title: string; content: string }[];
  // Rows have a null prototype, which Client Components reject.
  return rows.map(({ slug, title, content }) => ({ slug, title, content }));
}

/** Tags, categories and series in `scope`. */
export async function getTaxonomies(scope: ArticleScope): Promise<Taxonomies> {
  await connection();
  const db = getArticleDb();
  const where = scopeCondition(scope);

  const column = (sql: string) =>
    (db.prepare(sql).all(...where.params) as { value: string }[]).map(
      (row) => row.value,
    );

  return {
    tags: column(
      `SELECT DISTINCT t.tag AS value FROM article_tags t
       JOIN articles a ON a.slug = t.slug WHERE ${where.sql} ORDER BY 1`,
    ),
    categories: column(
      `SELECT DISTINCT a.category AS value FROM articles a
       WHERE ${where.sql} ORDER BY 1`,
    ),
    series: column(
      `SELECT DISTINCT a.series AS value FROM articles a
       WHERE ${where.sql} AND COALESCE(a.series, '') != '' ORDER BY 1`,
    ),
  };
}

/** The published articles on either side of `article` in its series. */
export async function getSeriesNeighbors(
  article: ArticleMetadata,
): Promise<SeriesNeighbors | null> {
  const { series, seriesOrder } = article;
  if (!series || seriesOrder === null) return null;

  await connection();
  const where = combine([
    scopeCondition("published"),
    { sql: "a.series = ?", params: [series] },
  ]);
  const articles = selectMetadata(
    getArticleDb(),
    where,
    "ORDER BY a.series_order",
  );
  const index = articles.findIndex((a) => a.slug === article.slug);

  return {
    series,
    previous: articles[index - 1] ?? null,
    next: articles[index + 1] ?? null,
  };
}

/** Fails rather than overwrite when the slug is taken. */
export async function createArticle(
  article: ArticleMetadata,
  content: string,
): Promise<void> {
  transaction((db) => {
    const seriesOrder = resolveSeriesOrder(db, article, null);
    db.prepare(
      `INSERT INTO articles (${ARTICLE_COLUMNS}, content)
       VALUES ($slug, $title, $category, $series, $seriesOrder,
         $createdAt, $modifiedAt, $published, $content)`,
    ).run(toParams({ ...article, seriesOrder }, content));
    insertTags(db, article.slug, article.tags);
  });
}

/** Updates an article; publishing a draft gives it a new slug. */
export async function updateArticle(
  article: ArticleMetadata,
  content: string,
): Promise<void> {
  transaction((db) => {
    const [existing] = selectMetadata(db, {
      sql: "a.slug = ?",
      params: [article.slug],
    });
    if (!existing) {
      throw new Error(`Article not found: ${article.slug}`);
    }

    const resolved = {
      ...article,
      seriesOrder: resolveSeriesOrder(db, article, existing),
    };
    const updated =
      !existing.published && resolved.published
        ? publishedNow(resolved)
        : resolved;

    // Tags go first and come back last, so the slug can change under them.
    db.prepare("DELETE FROM article_tags WHERE slug = ?").run(existing.slug);
    db.prepare(
      `UPDATE articles SET slug = $slug, title = $title, category = $category,
         series = $series, series_order = $seriesOrder,
         created_at = $createdAt, modified_at = $modifiedAt,
         published = $published, content = $content
       WHERE slug = $oldSlug`,
    ).run({ ...toParams(updated, content), oldSlug: existing.slug });
    insertTags(db, updated.slug, updated.tags);
  });
}

// --- Query building ---

function scopeCondition(scope: ArticleScope): Condition {
  switch (scope) {
    case "public":
      return {
        sql: "a.published = 1 AND a.slug != ?",
        params: [siteConfig.aboutSlug],
      };
    case "published":
      return { sql: "a.published = 1", params: [] };
    case "drafts":
      return { sql: "a.published = 0", params: [] };
    case "all":
      return { sql: "1 = 1", params: [] };
  }
}

/** LIKE and NOCASE ignore case for ASCII letters only. */
function searchConditions(params: ArticleSearchParams): Condition[] {
  const conditions: Condition[] = [];
  const keyword = getParam(params.keyword);
  const tag = getParam(params.tag);
  const series = getParam(params.series);
  const category = getParam(params.category);

  if (keyword) {
    const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push({
      sql: `(a.title LIKE ? ESCAPE '\\' OR a.slug LIKE ? ESCAPE '\\'
        OR a.category LIKE ? ESCAPE '\\' OR a.series LIKE ? ESCAPE '\\'
        OR EXISTS (SELECT 1 FROM article_tags t
          WHERE t.slug = a.slug AND t.tag LIKE ? ESCAPE '\\'))`,
      params: Array(5).fill(pattern),
    });
  }

  // Comma-separated; an article must carry every tag.
  for (const searchTag of splitTags(tag)) {
    conditions.push({
      sql: `a.slug IN (SELECT slug FROM article_tags
        WHERE tag = ? COLLATE NOCASE)`,
      params: [searchTag],
    });
  }

  if (series) {
    conditions.push({ sql: "a.series = ? COLLATE NOCASE", params: [series] });
  }
  if (category) {
    conditions.push({
      sql: "a.category = ? COLLATE NOCASE",
      params: [category],
    });
  }
  return conditions;
}

/** Missing values go last in either order; the slug breaks ties. */
function orderClause(params: ArticleSearchParams): string {
  const { field, order } = getSortConfig(params);
  const column = SORT_COLUMNS[field] ?? "a.created_at";
  const direction = order === "asc" ? "ASC" : "DESC";
  return `ORDER BY ${column} IS NULL, ${column} ${direction}, a.slug ${direction}`;
}

function combine(conditions: Condition[]): Condition {
  return {
    sql: conditions.map((c) => `(${c.sql})`).join(" AND "),
    params: conditions.flatMap((c) => c.params),
  };
}

// --- Helpers ---

function selectMetadata(
  db: DatabaseSync,
  where: Condition,
  suffix: string = "",
): ArticleMetadata[] {
  const rows = db
    .prepare(`${SELECT_METADATA} WHERE ${where.sql} ${suffix}`)
    .all(...where.params) as ArticleRow[];
  return rows.map(toMetadata);
}

/**
 * A new order whenever the article is new to its series (created directly in
 * one, freshly assigned to one via edit, or moved between series) or its order
 * is missing — the old order no longer applies.
 */
function resolveSeriesOrder(
  db: DatabaseSync,
  article: ArticleMetadata,
  existing: ArticleMetadata | null,
): number | null {
  if (!article.series) return null;
  if (existing?.series === article.series && article.seriesOrder != null) {
    return article.seriesOrder;
  }
  const { next } = db
    .prepare(
      `SELECT COALESCE(MAX(series_order), -1) + 1 AS next FROM articles
       WHERE series = ? AND slug != ?`,
    )
    .get(article.series, article.slug) as { next: number };
  return next;
}

/** Draft to published: re-slugged and re-dated to the moment of publishing. */
function publishedNow(article: ArticleMetadata): ArticleMetadata {
  const now = new Date();
  const createdAt = now.toISOString();
  return {
    ...article,
    slug: formatDateTimeCompact(now),
    createdAt,
    modifiedAt: createdAt,
  };
}

/** A tag given twice is kept once. */
function insertTags(db: DatabaseSync, slug: string, tags: string[]): void {
  const insert = db.prepare(
    "INSERT OR IGNORE INTO article_tags (slug, tag) VALUES (?, ?)",
  );
  for (const tag of tags) insert.run(slug, tag);
}

function toMetadata(row: ArticleRow): ArticleMetadata {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    series: row.series,
    seriesOrder: row.series_order,
    tags: JSON.parse(row.tags) as string[],
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
    published: row.published !== 0,
  };
}

function toDetail(row: DetailRow): ArticleDetail {
  return { metadata: toMetadata(row), content: row.content };
}

function toParams(article: ArticleMetadata, content: string) {
  return {
    slug: article.slug,
    title: article.title,
    category: article.category,
    series: article.series,
    seriesOrder: article.seriesOrder,
    createdAt: article.createdAt,
    modifiedAt: article.modifiedAt,
    published: article.published ? 1 : 0,
    content,
  };
}
