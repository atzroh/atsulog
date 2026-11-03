/** MIME type handling for uploaded images. */

/** MIME types whose conventional extension is not simply the subtype. */
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

const FALLBACK_EXTENSION = "png";

/** e.g. "IMAGE/PNG; q=1" -> "image/png". */
export function normalizeMimeType(mimeType: string): string {
  return mimeType.split(";")[0].trim().toLowerCase();
}

/**
 * The dot-less extension for an image URL. Falls back to the subtype so
 * newer formats such as image/avif need no table entry.
 */
export function extensionForMimeType(mimeType: string): string {
  const normalized = normalizeMimeType(mimeType);
  const mapped = MIME_TO_EXTENSION[normalized];
  if (mapped) return mapped;

  // "image/svg+xml" -> "svg", "image/avif" -> "avif"
  const subtype = normalized.split("/")[1]?.split("+")[0] ?? "";
  const cleaned = subtype.replace(/[^a-z0-9]/g, "");

  return cleaned || FALLBACK_EXTENSION;
}

