import "server-only";

import type { DatabaseSync } from "node:sqlite";

import { connection } from "next/server";

import type {
  ArticleMetadata,
  ArticleDetail,
} from "@/app/lib/article/article-types";
import {
  getNextSeriesOrder,
  generateSlug,
} from "@/app/lib/article/article-utils";
import { getDb, transaction } from "@/app/lib/db/db";
import { siteConfig } from "@/app/lib/site-config";

// --- Constants ---

const METADATA_COLUMNS = `slug, title, category, series, series_order, tags,
  created_at, modified_at, published`;

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

// --- Public API ---

export async function getArticles(): Promise<ArticleMetadata[]> {
  // Request time only: a build that opened the database would create it.
  await connection();
  return selectArticles(getDb());
}

/** Published articles, excluding the about page. */
export async function getPublicArticles(): Promise<ArticleMetadata[]> {
  return (await getArticles()).filter(
    (a) => a.published && a.slug !== siteConfig.aboutSlug,
  );
}

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetail | null> {
  await connection();
  const row = getDb()
    .prepare(`SELECT ${METADATA_COLUMNS}, content FROM articles WHERE slug = ?`)
    .get(slug) as (ArticleRow & { content: string }) | undefined;
  if (!row) return null;

  return { metadata: toMetadata(row), content: row.content };
}

/** Fails rather than overwrite when the slug is taken. */
export async function createArticle(
  article: ArticleMetadata,
  content: string,
): Promise<void> {
  transaction((db) => {
    const seriesOrder = resolveSeriesOrder(article, null, selectArticles(db));
    db.prepare(
      `INSERT INTO articles (${METADATA_COLUMNS}, content)
       VALUES ($slug, $title, $category, $series, $seriesOrder, $tags,
         $createdAt, $modifiedAt, $published, $content)`,
    ).run(toParams({ ...article, seriesOrder }, content));
  });
}

/** Updates an article; publishing a draft gives it a new slug. */
export async function updateArticle(
  article: ArticleMetadata,
  content: string,
): Promise<void> {
  transaction((db) => {
    const articles = selectArticles(db);
    const existing = articles.find((a) => a.slug === article.slug);
    if (!existing) {
      throw new Error(`Article not found: ${article.slug}`);
    }

    const updated = {
      ...article,
      seriesOrder: resolveSeriesOrder(article, existing, articles),
    };

    // Draft to published: re-slugged and re-dated to the moment of publishing.
    if (!existing.published && updated.published) {
      const now = new Date();
      updated.slug = generateSlug(now);
      updated.createdAt = now.toISOString();
      updated.modifiedAt = updated.createdAt;
    }

    db.prepare(
      `UPDATE articles SET slug = $slug, title = $title, category = $category,
         series = $series, series_order = $seriesOrder, tags = $tags,
         created_at = $createdAt, modified_at = $modifiedAt,
         published = $published, content = $content
       WHERE slug = $oldSlug`,
    ).run({ ...toParams(updated, content), oldSlug: existing.slug });
  });
}

// --- Helpers ---

function selectArticles(db: DatabaseSync): ArticleMetadata[] {
  const rows = db
    .prepare(`SELECT ${METADATA_COLUMNS} FROM articles`)
    .all() as ArticleRow[];
  return rows.map(toMetadata);
}

/**
 * A new order whenever the article is new to its series (created directly in
 * one, freshly assigned to one via edit, or moved between series) or its order
 * is missing — the old order no longer applies.
 */
function resolveSeriesOrder(
  article: ArticleMetadata,
  existing: ArticleMetadata | null,
  articles: ArticleMetadata[],
): number | null {
  if (!article.series) return null;
  if (existing?.series === article.series && article.seriesOrder != null) {
    return article.seriesOrder;
  }
  return getNextSeriesOrder(
    article.series,
    articles.filter((a) => a.slug !== article.slug),
  );
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

function toParams(article: ArticleMetadata, content: string) {
  return {
    slug: article.slug,
    title: article.title,
    category: article.category,
    series: article.series,
    seriesOrder: article.seriesOrder,
    tags: JSON.stringify(article.tags),
    createdAt: article.createdAt,
    modifiedAt: article.modifiedAt,
    published: article.published ? 1 : 0,
    content,
  };
}
