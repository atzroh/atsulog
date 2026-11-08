import type { CategoryCount } from "@/app/lib/article/article-types";
import { taxonomyHref } from "@/app/lib/article/article-utils";
import { Tag } from "@/app/components/ui/tag";
import { HomeSection } from "@/app/components/home/home-section";

/** Every category with its article count. */
export function CategoryGrid({ categories }: { categories: CategoryCount[] }) {
  if (categories.length === 0) return null;

  return (
    <HomeSection title="Categories">
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {categories.map(({ category, count }) => (
          <li key={category}>
            <Tag
              label={category}
              href={taxonomyHref("/articles", "category", category)}
              variant="category"
              count={count}
            />
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
