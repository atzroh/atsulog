import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { mimeTypeForExtension } from "@/app/lib/image/image-mime";

/** Root the served files must stay within. */
const IMAGES_ROOT = resolve(process.cwd(), "data", "images");

/** A single path segment must not contain a separator or NUL, nor navigate. */
function isUnsafeSegment(segment: string): boolean {
  return /[/\\]|\0/.test(segment) || segment === "." || segment === "..";
}

/**
 * Resolves a requested path to an absolute file path, but only if it stays
 * inside IMAGES_ROOT. Returns null for anything that would escape the root,
 * so a crafted "../" (e.g. sent as "..%2F") cannot read arbitrary files.
 * The final containment check is the real guard; the segment check just
 * rejects obviously malformed input early.
 */
function resolveWithinImagesRoot(dateDir: string, filename: string) {
  if (isUnsafeSegment(dateDir) || isUnsafeSegment(filename)) {
    return null;
  }

  const filePath = resolve(IMAGES_ROOT, dateDir, filename);
  if (filePath !== IMAGES_ROOT && !filePath.startsWith(IMAGES_ROOT + sep)) {
    return null;
  }

  return filePath;
}

/**
 * Route handler to serve images stored in the data directory.
 * URL pattern: /images/[dateDir]/[filename]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path;

  if (!pathParts || pathParts.length < 2) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const [dateDir, filename] = pathParts;
  const filePath = resolveWithinImagesRoot(dateDir, filename);
  if (!filePath) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const buffer = await readFile(filePath);

    // Determine content type based on extension
    const ext = filename.includes(".") ? filename.split(".").pop() : "";
    const contentType = mimeTypeForExtension(ext ?? "");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Stop the browser from second-guessing the declared type.
      "X-Content-Type-Options": "nosniff",
    };
    // An SVG opened directly would otherwise run its own <script> on our
    // origin; neutralize it while still allowing the image to render.
    if (contentType === "image/svg+xml") {
      headers["Content-Security-Policy"] =
        "default-src 'none'; style-src 'unsafe-inline'";
    }

    return new NextResponse(buffer, { headers });
  } catch {
    return new NextResponse("Image Not Found", { status: 404 });
  }
}
