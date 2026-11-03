import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ImageList } from "@/app/components/editor/image-list";
import { listImages } from "@/app/lib/image/image-store";
import { getImageUsers } from "@/app/lib/image/image-usage";

export default async function ImagesPage() {
  // First, since it waits for request time before any database is opened.
  const users = await getImageUsers();
  const images = listImages().map((image) => ({
    ...image,
    users: users.get(image.hash) ?? [],
  }));

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Images ({images.length})
      </h1>
      <ImageList images={images} />
      <nav aria-label="Images navigation" className="border-t pt-[2.5rem]">
        <Link
          href="/edit"
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center"
        >
          <ArrowLeft className="size-[1rem] mr-[0.5rem]" />
          Back to Edit List
        </Link>
      </nav>
    </main>
  );
}
