/**
 * MIME type <-> extension mapping for uploaded images, shared so the upload
 * action and the /images route never disagree.
 */

/** MIME types whose conventional extension is not simply the subtype. */
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

/** Extensions whose Content-Type is not simply "image/<ext>". */
const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  ico: "image/x-icon",
};

const FALLBACK_MIME = "image/png";
const FALLBACK_EXTENSION = "png";

/** e.g. "IMAGE/PNG; q=1" -> "image/png". */
function normalizeMimeType(mimeType: string): string {
  return mimeType.split(";")[0].trim().toLowerCase();
}

/**
 * The dot-less extension to store a file under. Falls back to the subtype so
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

/** The Content-Type for a stored file's extension (with or without a dot). */
export function mimeTypeForExtension(extension: string): string {
  const cleaned = extension.replace(/^\./, "").toLowerCase();
  if (!cleaned) return FALLBACK_MIME;

  const mapped = EXTENSION_TO_MIME[cleaned];
  if (mapped) return mapped;

  return /^[a-z0-9]+$/.test(cleaned) ? `image/${cleaned}` : FALLBACK_MIME;
}
