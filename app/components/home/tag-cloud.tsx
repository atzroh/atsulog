import type { TagCount } from "@/app/lib/article/article-types";
import { taxonomyHref } from "@/app/lib/article/article-utils";
import { Tag } from "@/app/components/ui/tag";
import { HomeSection } from "@/app/components/home/home-section";

/** Every tag with its article count. */
export function TagCloud({ tags }: { tags: TagCount[] }) {
  if (tags.length === 0) return null;

  return (
    <HomeSection title="Tags">
      <ul className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Tag
              label={tag}
              href={taxonomyHref("/articles", "tag", tag)}
              count={count}
            />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
