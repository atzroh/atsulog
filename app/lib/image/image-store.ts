import "server-only";

import { createHash } from "node:crypto";
import { getImageDb } from "@/app/lib/db/db";
import { extensionForMimeType } from "@/app/lib/image/image-mime";

/** Hex digits of SHA-256 kept as the key; 64 bits is plenty for one blog. */
export const HASH_LENGTH = 16;

const HASH_PATTERN = new RegExp(`^[0-9a-f]{${HASH_LENGTH}}$`);

export type StoredImage = {
  mimeType: string;
  data: Uint8Array<ArrayBuffer>;
};

export type ImageSummary = {
  hash: string;
  url: string;
  createdAt: string;
  size: number;
};

export function hashImage(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex").slice(0, HASH_LENGTH);
}

/** e.g. "/images/3f9a1c07e2b84d5a.png"; the extension is only a hint. */
export function imageUrl(hash: string, mimeType: string): string {
  return `/images/${hash}.${extensionForMimeType(mimeType)}`;
}

export function isImageHash(value: string): boolean {
  return HASH_PATTERN.test(value);
}

/** Keeps the first row for identical bytes, so re-uploading reuses its URL. */
export function saveImage(
  data: Uint8Array,
  mimeType: string,
): { hash: string; url: string } {
  const hash = hashImage(data);
  getImageDb()
    .prepare(
      `INSERT OR IGNORE INTO images (hash, mime_type, created_at, data)
       VALUES (?, ?, ?, ?)`,
    )
    .run(hash, mimeType, new Date().toISOString(), data);
  return { hash, url: imageUrl(hash, mimeType) };
}

export function getImage(hash: string): StoredImage | null {
  const row = getImageDb()
    .prepare("SELECT mime_type, data FROM images WHERE hash = ?")
    .get(hash) as
    | { mime_type: string; data: Uint8Array<ArrayBuffer> }
    | undefined;
  return row ? { mimeType: row.mime_type, data: row.data } : null;
}

/** Newest first, without the bytes. */
export function listImages(): ImageSummary[] {
  const rows = getImageDb()
    .prepare(
      `SELECT hash, mime_type, created_at, length(data) AS size
       FROM images ORDER BY created_at DESC`,
    )
    .all() as {
    hash: string;
    mime_type: string;
    created_at: string;
    size: number;
  }[];
  return rows.map((row) => ({
    hash: row.hash,
    url: imageUrl(row.hash, row.mime_type),
    createdAt: row.created_at,
    size: row.size,
  }));
}

export function deleteImage(hash: string): void {
  getImageDb().prepare("DELETE FROM images WHERE hash = ?").run(hash);
}
