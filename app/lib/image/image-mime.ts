/**
 * Shared MIME type <-> file extension mapping for uploaded images.
 * Kept in one place so the upload action and the /images route handler can
 * never drift apart on what a stored file is called and how it is served.
 */

/**
 * MIME types whose conventional extension is not simply the subtype.
 */
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

/**
 * Extensions whose Content-Type is not simply "image/<ext>".
 */
const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  ico: "image/x-icon",
};

/** Content-Type used when a stored file carries no usable extension. */
const FALLBACK_MIME = "image/png";

/** Extension used when a MIME type yields nothing usable. */
const FALLBACK_EXTENSION = "png";

/**
 * Strips parameters and casing from a MIME type, e.g. "IMAGE/PNG; q=1" -> "image/png".
 */
function normalizeMimeType(mimeType: string): string {
  return mimeType.split(";")[0].trim().toLowerCase();
}

/**
 * Derives the stored file extension (without a leading dot) for a MIME type.
 * Falls back to the subtype itself so newer formats such as image/avif work
 * without needing an entry in the table.
 * @param mimeType - The browser-reported MIME type of the uploaded file.
 * @returns A lowercase, dot-less extension.
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

/**
 * Resolves the Content-Type to serve a stored file with, based on its extension.
 * @param extension - Extension with or without a leading dot.
 * @returns A Content-Type header value.
 */
export function mimeTypeForExtension(extension: string): string {
  const cleaned = extension.replace(/^\./, "").toLowerCase();
  if (!cleaned) return FALLBACK_MIME;

  const mapped = EXTENSION_TO_MIME[cleaned];
  if (mapped) return mapped;

  return /^[a-z0-9]+$/.test(cleaned) ? `image/${cleaned}` : FALLBACK_MIME;
}
