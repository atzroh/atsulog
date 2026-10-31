// One-off: copies data/articles.json and data/articles/*.md into atsulog.db.
// Usage: node scripts/migrate-to-sqlite.mjs <dataDir>
// Leaves the old files in place. Delete this script along with them.

import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

// Same as app/lib/db/db.ts.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS articles (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  series       TEXT,
  series_order INTEGER,
  tags         TEXT NOT NULL DEFAULT '[]',
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  modified_at  TEXT NOT NULL,
  published    INTEGER NOT NULL
);
`;

const dataDir = process.argv[2];
if (!dataDir) {
  console.error("Usage: node scripts/migrate-to-sqlite.mjs <dataDir>");
  process.exit(1);
}

const db = new DatabaseSync(path.join(dataDir, "atsulog.db"));
db.exec("PRAGMA journal_mode = WAL");
db.exec(SCHEMA);

const { count } = db.prepare("SELECT COUNT(*) AS count FROM articles").get();
if (count > 0) {
  console.log(`atsulog.db already has ${count} articles; nothing to do.`);
  process.exit(0);
}

const articles = JSON.parse(
  readFileSync(path.join(dataDir, "articles.json"), "utf8"),
);

const insert = db.prepare(
  `INSERT INTO articles (slug, title, category, series, series_order, tags,
     content, created_at, modified_at, published)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);

db.exec("BEGIN IMMEDIATE");
try {
  for (const article of articles) {
    // filePath is relative to the project root, i.e. data/articles/<name>.md.
    const content = readFileSync(
      path.join(dataDir, "articles", path.basename(article.filePath)),
      "utf8",
    );
    // Defaults match the old getArticles(); viewCount is dropped.
    insert.run(
      article.slug,
      article.title,
      article.category,
      article.series ?? null,
      article.seriesOrder ?? null,
      JSON.stringify(article.tags ?? []),
      content,
      article.createdAt,
      article.modifiedAt,
      (article.published ?? true) ? 1 : 0,
    );
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}

console.log(`Migrated ${articles.length} articles into atsulog.db.`);
