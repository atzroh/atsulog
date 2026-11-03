"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/lib/auth/auth";
import { normalizeMimeType } from "@/app/lib/image/image-mime";
import {
  deleteImage,
  isImageHash,
  saveImage,
} from "@/app/lib/image/image-store";
import { getImageUsers } from "@/app/lib/image/image-usage";

/** Stores the editor's upload in images.db; returns its URL and alt text. */
export async function uploadImageAction(formData: FormData) {
  await requireAuth();

  const file = formData.get("image") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Stored as given and served back as is, so only images get in.
  const mimeType = normalizeMimeType(file.type);
  if (!mimeType.startsWith("image/")) {
    throw new Error("Not an image");
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const { hash, url } = saveImage(data, mimeType);

  // The hash, like the URL, so no original file name gets into an article.
  return { url, alt: hash };
}

/** Deletes an image no article mentions; a used one is kept. */
export async function deleteImageAction(hash: string) {
  await requireAuth();

  if (!isImageHash(hash)) {
    throw new Error("Invalid image hash");
  }
  if ((await getImageUsers()).has(hash)) {
    throw new Error("Image is still used by an article");
  }

  deleteImage(hash);
  revalidatePath("/edit/images");
}
