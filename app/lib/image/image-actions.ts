"use server";

import { writeFile, mkdir, access } from "node:fs/promises";
import { join, parse } from "node:path";
import { requireAuth } from "@/app/lib/auth/auth";
import { DATA_DIR } from "@/app/lib/fs-utils";
import {
  formatDateCompact,
  formatDateTimeCompact,
} from "@/app/lib/date-format";
import { sanitizeFileName } from "@/app/lib/image/image-file-name";
import { extensionForMimeType } from "@/app/lib/image/image-mime";

/**
 * Saves the editor's upload under data/images/YYYYMMDD/, with a name that never
 * breaks a Markdown URL. Returns the URL and the original name for alt text.
 */
export async function uploadImageAction(formData: FormData) {
  await requireAuth();

  const file = formData.get("image") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const dateDir = formatDateCompact();
  const uploadDir = join(DATA_DIR, "images", dateDir);

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch {
    // A real failure surfaces at writeFile.
  }

  // From the MIME type, not the name: path.parse("shot.png (1)") gives ext
  // ".png (1)", whose space would break the Markdown URL.
  const ext = `.${extensionForMimeType(file.type)}`;
  // A timestamp when nothing survives sanitizing.
  const safeName =
    sanitizeFileName(parse(file.name).name) || formatDateTimeCompact();
  let finalFileName = `${safeName}${ext}`;
  let counter = 1;

  while (true) {
    const filePath = join(uploadDir, finalFileName);
    try {
      await access(filePath);
      finalFileName = `${safeName}-${counter}${ext}`;
      counter++;
    } catch {
      break;
    }
  }

  const finalPath = join(uploadDir, finalFileName);
  await writeFile(finalPath, buffer);

  return {
    url: `/images/${dateDir}/${finalFileName}`,
    name: file.name,
  };
}
