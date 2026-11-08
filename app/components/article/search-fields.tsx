import { Search } from "lucide-react";
import { FormField } from "@/app/components/ui/form-field";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";
import { getParam } from "@/app/lib/article/article-utils";

type SearchFieldsProps = {
  searchParams: ArticleSearchParams;
};

export function SearchFields({ searchParams }: SearchFieldsProps) {
  return (
    <div className="mb-8">
      <FormField
        id="keyword"
        defaultValue={getParam(searchParams.keyword)}
        placeholder="Search articles..."
        required={false}
        icon={Search}
      />
    </div>
  );
}
