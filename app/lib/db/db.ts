import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = path.join(process.cwd(), "data", "atsulog.db");

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

/** Survives dev HMR, which would otherwise open a connection per reload. */
const globalForDb = globalThis as typeof globalThis & {
  atsulogDb?: DatabaseSync;
};

/** Opened on first use, so `next build` never creates the file. */
export function getDb(): DatabaseSync {
  if (!globalForDb.atsulogDb) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec(SCHEMA);
    globalForDb.atsulogDb = db;
  }
  return globalForDb.atsulogDb;
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
