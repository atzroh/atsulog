import "server-only";

import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

import type {
  ArticleMetadata,
  ArticleDetail,
} from "@/app/lib/article/article-types";
import {
  getNextSeriesOrder,
  generateSlug,
} from "@/app/lib/article/article-utils";

// --- Constants ---

const PROJECT_ROOT = process.cwd();
const ARTICLES_JSON_PATH = path.join(PROJECT_ROOT, "data", "articles.json");

// --- Public API ---

/**
 * Retrieves all article metadata.
 */
export async function getArticles(): Promise<ArticleMetadata[]> {
  try {
    const content = await readFile(ARTICLES_JSON_PATH, "utf8");
    const parsed = JSON.parse(content) as unknown;

    if (!Array.isArray(parsed)) {
      throw new TypeError("data/articles.json must contain an array.");
    }

    return (parsed as ArticleMetadata[]).map((article) => ({
      ...article,
      published: article.published ?? true,
    }));
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return [];
    }
    throw wrapError(
      error,
      `Failed to read article metadata from ${ARTICLES_JSON_PATH}`,
    );
  }
}

/**
 * Retrieves an article by its slug, including its content.
 */
export async function getArticleBySlug(
  articles: ArticleMetadata[],
  slug: string,
): Promise<ArticleDetail | null> {
  const metadata = articles.find((article) => article.slug === slug);
  if (!metadata) return null;

  const content = await readContent(metadata.filePath);
  return { metadata, content };
}

/**
 * Saves the entire list of articles.
 */
export async function saveArticles(articles: ArticleMetadata[]): Promise<void> {
  try {
    await mkdir(path.dirname(ARTICLES_JSON_PATH), { recursive: true });
    const content = JSON.stringify(articles, null, 2);
    await writeFile(ARTICLES_JSON_PATH, `${content}\n`, "utf8");
  } catch (error: unknown) {
    throw wrapError(
      error,
      `Failed to save article metadata to ${ARTICLES_JSON_PATH}`,
    );
  }
}

/**
 * Updates or creates an article.
 */
export async function saveArticle(
  articles: ArticleMetadata[],
  newArticle: ArticleMetadata,
  content?: string,
): Promise<void> {
  const index = articles.findIndex(
    (article) => article.slug === newArticle.slug,
  );
  const updatedList = [...articles];
  const existingBeforeUpdate = index !== -1 ? updatedList[index] : null;

  let articleToSave = { ...newArticle };

  // Recalculate seriesOrder whenever the article is new to its series (created
  // directly in one, freshly assigned to one via edit, or moved between
  // series) or its seriesOrder is missing — the old order no longer applies.
  if (
    articleToSave.series &&
    (!existingBeforeUpdate ||
      existingBeforeUpdate.series !== articleToSave.series ||
      articleToSave.seriesOrder == null)
  ) {
    articleToSave.seriesOrder = getNextSeriesOrder(
      articleToSave.series,
      articles.filter((article) => article.slug !== articleToSave.slug),
    );
  } else if (!articleToSave.series) {
    articleToSave.seriesOrder = null;
  }

  let oldFilePath: string | null = null;

  if (index !== -1) {
    const existing = updatedList[index];

    // Transition from draft to published
    if (!existing.published && articleToSave.published) {
      const now = new Date();
      const isoString = now.toISOString();
      const newSlug = generateSlug(now);

      oldFilePath = existing.filePath;
      articleToSave.slug = newSlug;
      articleToSave.createdAt = isoString;
      articleToSave.modifiedAt = isoString;
      articleToSave.filePath = `data/articles/${newSlug}.md`;
    }

    // Preserve existing fields if not provided
    articleToSave = { ...existing, ...articleToSave };
    updatedList[index] = articleToSave;
  } else {
    updatedList.push(articleToSave);
  }

  const tasks: Promise<void>[] = [saveArticles(updatedList)];
  if (content !== undefined) {
    tasks.push(writeContent(articleToSave.filePath, content));
  }

  if (oldFilePath && oldFilePath !== articleToSave.filePath) {
    tasks.push(
      (async () => {
        try {
          await unlink(resolveProjectPath(oldFilePath!));
        } catch (e) {
          console.error(`Failed to delete old draft file: ${oldFilePath}`, e);
        }
      })(),
    );
  }

  await Promise.all(tasks);
}

/**
 * Increments the view count of an article.
 */
export async function incrementViewCount(
  articles: ArticleMetadata[],
  slug: string,
): Promise<void> {
  const index = articles.findIndex((article) => article.slug === slug);
  if (index === -1) return;

  const updatedList = [...articles];
  updatedList[index] = {
    ...updatedList[index],
    viewCount: (updatedList[index].viewCount ?? 0) + 1,
  };

  await saveArticles(updatedList);
}

// --- Helpers ---

async function readContent(filePath: string): Promise<string> {
  const fullPath = resolveProjectPath(filePath);
  if (path.extname(fullPath) !== ".md") {
    throw new TypeError("Path must point to a markdown (.md) file.");
  }

  try {
    return await readFile(fullPath, "utf8");
  } catch (error: unknown) {
    if (isNotFound(error)) {
      throw new Error(`Article content file not found: ${fullPath}`, {
        cause: error,
      });
    }
    throw wrapError(error, `Failed to read article content from ${fullPath}`);
  }
}

async function writeContent(filePath: string, content: string): Promise<void> {
  const fullPath = resolveProjectPath(filePath);
  try {
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf8");
  } catch (error: unknown) {
    throw wrapError(error, `Failed to save article content to ${fullPath}`);
  }
}

function resolveProjectPath(filePath: string): string {
  const resolvedPath = path.resolve(
    /*turbopackIgnore: true*/ PROJECT_ROOT,
    filePath,
  );
  const relativePath = path.relative(PROJECT_ROOT, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new TypeError("Path must point to a file inside the project.");
  }
  return resolvedPath;
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function wrapError(error: unknown, message: string): Error {
  if (error instanceof SyntaxError) {
    return new Error(`${message} (Invalid JSON)`, { cause: error });
  }
  return new Error(message, { cause: error });
}
