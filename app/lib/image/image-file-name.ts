/** Upper bound for a sanitized stem, leaving room for a suffix and extension. */
const MAX_FILENAME_STEM_LENGTH = 100;

/**
 * Collapses everything outside [a-z0-9._-] into "-", so the stem cannot end a
 * Markdown link destination early. Empty when nothing usable remains.
 */
export function sanitizeFileName(stem: string): string {
  return stem
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, MAX_FILENAME_STEM_LENGTH)
    .replace(/[-.]+$/g, "");
}
