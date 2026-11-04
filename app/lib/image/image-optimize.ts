import sharp from "sharp";

/** Twice the article column, for high-density screens. */
const MAX_EDGE = 1600;

/** Re-encoded as WebP; anything else (GIF, SVG, ICO...) is kept as is. */
const CONVERTIBLE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
]);

export type ImageData = {
  data: Uint8Array;
  mimeType: string;
};

/**
 * Shrinks to MAX_EDGE and converts to WebP. Metadata (EXIF, GPS) is
 * dropped; PNG stays lossless so text in screenshots does not blur.
 */
export async function optimizeImage(
  data: Uint8Array,
  mimeType: string,
): Promise<ImageData> {
  if (!CONVERTIBLE.has(mimeType)) return { data, mimeType };

  const output = await sharp(data)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp(mimeType === "image/png" ? { lossless: true } : { quality: 80 })
    .toBuffer();

  return { data: new Uint8Array(output), mimeType: "image/webp" };
}
