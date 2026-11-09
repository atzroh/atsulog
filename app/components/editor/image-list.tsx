import Image from "next/image";
import Link from "next/link";

import { ImageCopyButton } from "@/app/components/editor/image-copy-button";
import { ImageDeleteButton } from "@/app/components/editor/image-delete-button";
import type { ImageSummary } from "@/app/lib/image/image-store";
import type { ImageUser } from "@/app/lib/image/image-usage";

type ImageEntry = ImageSummary & { users: ImageUser[] };

const SECTION_LABEL = "text-[11px] uppercase tracking-[0.18em]";

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** One image: the picture, then what uses it, its size and the actions. */
function ImageCard({ image }: { image: ImageEntry }) {
  const [user, ...others] = image.users;

  return (
    <li className="flex flex-col gap-2.5">
      <a
        href={image.url}
        target="_blank"
        rel="noreferrer"
        className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-50"
      >
        <Image
          src={image.url}
          alt={image.hash}
          fill
          unoptimized
          className="object-cover"
        />
      </a>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-xs text-muted tabular-nums">
          {user ? (
            <p className="truncate text-[13px] text-foreground">
              <Link
                href={`/admin/edit/${user.slug}`}
                className="hover:text-sky-600 transition-colors"
              >
                {user.title}
              </Link>
              {others.length > 0 && (
                <span className="text-muted"> +{others.length}</span>
              )}
            </p>
          ) : (
            <p className="truncate font-mono">{image.hash}</p>
          )}
          <p>{formatSize(image.size)}</p>
        </div>
        <ImageCopyButton url={image.url} />
        {!user && <ImageDeleteButton hash={image.hash} />}
      </div>
    </li>
  );
}

function ImageSection({
  label,
  images,
  className = "text-muted",
}: {
  label: string;
  images: ImageEntry[];
  className?: string;
}) {
  if (images.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className={`${SECTION_LABEL} ${className}`}>
        {label} · {images.length}
      </h2>
      <ul className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-3">
        {images.map((image) => (
          <ImageCard key={image.hash} image={image} />
        ))}
      </ul>
    </section>
  );
}

/** Stored images, unused first since those are what this page is for. */
export function ImageList({ images }: { images: ImageEntry[] }) {
  if (images.length === 0) {
    return <p className="text-sm text-muted">No images found.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <ImageSection
        label="Unused"
        images={images.filter((image) => image.users.length === 0)}
        className="text-orange-700"
      />
      <ImageSection
        label="In use"
        images={images.filter((image) => image.users.length > 0)}
      />
    </div>
  );
}
