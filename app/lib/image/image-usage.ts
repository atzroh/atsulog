import "server-only";

import { getArticleContents } from "@/app/lib/article/article-repository";
import { HASH_LENGTH } from "@/app/lib/image/image-store";

export type ImageUser = { slug: string; title: string };

/** "/images/<hash>" anywhere in a body; the extension does not matter. */
const IMAGE_REFERENCE = new RegExp(
  `/images/([0-9a-f]{${HASH_LENGTH}})\\b`,
  "g",
);

/** Hash -> the articles whose body mentions it, drafts included. */
export async function getImageUsers(): Promise<Map<string, ImageUser[]>> {
  const users = new Map<string, ImageUser[]>();
  for (const { slug, title, content } of await getArticleContents()) {
    const hashes = new Set(
      Array.from(content.matchAll(IMAGE_REFERENCE), (match) => match[1]),
    );
    for (const hash of hashes) {
      users.set(hash, [...(users.get(hash) ?? []), { slug, title }]);
    }
  }
  return users;
}
