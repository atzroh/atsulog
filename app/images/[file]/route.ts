import { type NextRequest, NextResponse } from "next/server";
import { getImage, isImageHash } from "@/app/lib/image/image-store";

/** Serves images from images.db at /images/<hash>.<ext>. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  // The extension is only a hint; the stored MIME type decides.
  const hash = file.split(".")[0];
  const image = isImageHash(hash) ? getImage(hash) : null;
  if (!image) {
    return new NextResponse("Image Not Found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": image.mimeType,
    "Cache-Control": "public, max-age=31536000, immutable",
    // Stop the browser from second-guessing the declared type.
    "X-Content-Type-Options": "nosniff",
  };
  // An SVG opened directly would otherwise run its own <script> on our
  // origin; neutralize it while still allowing the image to render.
  if (image.mimeType === "image/svg+xml") {
    headers["Content-Security-Policy"] =
      "default-src 'none'; style-src 'unsafe-inline'";
  }

  return new NextResponse(image.data, { headers });
}
