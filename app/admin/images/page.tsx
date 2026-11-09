import { ArrowLeft } from "lucide-react";

import { ImageList } from "@/app/components/editor/image-list";
import { listImages } from "@/app/lib/image/image-store";
import { getImageUsers } from "@/app/lib/image/image-usage";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageNav, PageNavLink } from "@/app/components/ui/page-nav";

export default async function ImagesPage() {
  // First, since it waits for request time before any database is opened.
  const users = await getImageUsers();
  const images = listImages().map((image) => ({
    ...image,
    users: users.get(image.hash) ?? [],
  }));
  const unused = images.filter((image) => image.users.length === 0).length;

  return (
    <main>
      <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <PageHeading>Images</PageHeading>
        <span className="text-[13px] text-muted tabular-nums">
          {images.length} {images.length === 1 ? "image" : "images"} · {unused}{" "}
          unused
        </span>
      </div>
      <ImageList images={images} />
      <PageNav label="Images navigation">
        <PageNavLink href="/admin" icon={ArrowLeft}>
          Back to Admin
        </PageNavLink>
      </PageNav>
    </main>
  );
}
