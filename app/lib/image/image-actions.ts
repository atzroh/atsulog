"use server";

import { writeFile, mkdir, access } from "node:fs/promises";
import { join, parse } from "node:path";
import { isAuthenticated } from "@/app/lib/auth/auth";
import {
  formatDateCompact,
  generateSlug,
  sanitizeFileName,
} from "@/app/lib/article/article-utils";
import { extensionForMimeType } from "@/app/lib/image/image-mime";

/**
 * Handles image upload from the Markdown editor.
 * Saves to data/images/YYYYMMDD/ with duplicate handling. The stored file name
 * is normalized so it never breaks a Markdown image URL.
 * @param formData - The form data containing the 'image' file.
 * @returns The image URL, plus the original file name for use as alt text.
 */
export async function uploadImageAction(formData: FormData) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("image") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. Prepare directory: data/images/YYYYMMDD
  const dateDir = formatDateCompact(new Date());
  const uploadDir = join(process.cwd(), "data", "images", dateDir);

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch {
    // Already exists or other error
  }

  // 2. Normalize the name, then handle duplicates.
  // The extension comes from the MIME type rather than from the original name:
  // path.parse("shot.png (1)") reports ext as ".png (1)", which would smuggle a
  // space back into the URL and break Markdown rendering.
  const ext = `.${extensionForMimeType(file.type)}`;
  // Fall back to a timestamp when nothing usable survives sanitizing
  const safeName = sanitizeFileName(parse(file.name).name) || generateSlug();
  let finalFileName = `${safeName}${ext}`;
  let counter = 1;

  while (true) {
    const filePath = join(uploadDir, finalFileName);
    try {
      await access(filePath);
      // If no error, file exists
      finalFileName = `${safeName}-${counter}${ext}`;
      counter++;
    } catch {
      // File does not exist, safe to use
      break;
    }
  }

  const finalPath = join(uploadDir, finalFileName);
  await writeFile(finalPath, buffer);

  // 3. Return the URL path, keeping the original name for display
  return {
    url: `/images/${dateDir}/${finalFileName}`,
    name: file.name,
  };
}
