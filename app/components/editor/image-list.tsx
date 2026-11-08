import Image from "next/image";
import Link from "next/link";

import { ImageCopyButton } from "@/app/components/editor/image-copy-button";
import { ImageDeleteButton } from "@/app/components/editor/image-delete-button";
import type { ImageSummary } from "@/app/lib/image/image-store";
import type { ImageUser } from "@/app/lib/image/image-usage";

type ImageEntry = ImageSummary & { users: ImageUser[] };

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Stored images with the articles using them; unused ones can be deleted. */
export function ImageList({ images }: { images: ImageEntry[] }) {
  if (images.length === 0) {
    return <p className="text-sm text-gray-400">No images found.</p>;
  }

  // Unused first, since those are what this page is for.
  const sorted = [
    ...images.filter((image) => image.users.length === 0),
    ...images.filter((image) => image.users.length > 0),
  ];

  return (
    <ul className="divide-y divide-gray-100">
      {sorted.map((image) => (
        <li key={image.hash} className="flex items-center gap-4 py-4">
          <a
            href={image.url}
            target="_blank"
            rel="noreferrer"
            className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-gray-50"
          >
            <Image
              src={image.url}
              alt={image.hash}
              fill
              unoptimized
              className="object-cover"
            />
          </a>
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="truncate font-mono font-medium text-gray-900">
              {image.hash}
            </p>
            <p className="text-gray-400">{formatSize(image.size)}</p>
            {image.users.length === 0 ? (
              <p className="text-amber-600">Unused</p>
            ) : (
              <p className="truncate">
                {image.users.map((user, index) => (
                  <span key={user.slug}>
                    {index > 0 && ", "}
                    <Link
                      href={`/admin/edit/${user.slug}`}
                      className="text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                    >
                      {user.title}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <ImageCopyButton url={image.url} />
            {image.users.length === 0 && (
              <ImageDeleteButton hash={image.hash} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
