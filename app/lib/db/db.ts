import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/** Where the databases and uploaded images live. */
export const DATA_DIR = path.join(process.cwd(), "data");

const ARTICLES_SCHEMA = `
CREATE TABLE IF NOT EXISTS articles (
  slug         TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,
  series       TEXT,
  series_order INTEGER,
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  modified_at  TEXT NOT NULL,
  published    INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS article_tags (
  slug TEXT NOT NULL REFERENCES articles(slug),
  tag  TEXT NOT NULL,
  PRIMARY KEY (slug, tag)
);
CREATE INDEX IF NOT EXISTS article_tags_tag ON article_tags(tag);
`;

/** A cache only, so it lives apart from the articles and their backups. */
const LINK_CARDS_SCHEMA = `
CREATE TABLE IF NOT EXISTS link_cards (
  url  TEXT PRIMARY KEY,
  card TEXT NOT NULL
);
`;

/** Survives dev HMR, which would otherwise open a connection per reload. */
const globalForDb = globalThis as typeof globalThis & {
  databases?: Map<string, DatabaseSync>;
};

export function getDb(): DatabaseSync {
  return openDatabase("articles.db", ARTICLES_SCHEMA);
}

export function getLinkCardDb(): DatabaseSync {
  return openDatabase("link-cards.db", LINK_CARDS_SCHEMA);
}

/** Runs `task` in a write transaction, rolling back if it throws. */
export function transaction<T>(task: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = task(db);
    db.exec("COMMIT");
    return result;
  } catch (error: unknown) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/** Opened on first use, so `next build` never creates the file. */
function openDatabase(fileName: string, schema: string): DatabaseSync {
  globalForDb.databases ??= new Map();
  let db = globalForDb.databases.get(fileName);
  if (!db) {
    const dbPath = path.join(DATA_DIR, fileName);
    mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA foreign_keys = ON");
    db.exec(schema);
    globalForDb.databases.set(fileName, db);
  }
  return db;
}
