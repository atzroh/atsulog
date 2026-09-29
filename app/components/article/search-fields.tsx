import { Search, Folder, BookOpen, Tag } from "lucide-react";
import { FormField } from "@/app/components/ui/form-field";
import type {
  ArticleSearchParams,
  TaxonomyCandidates,
} from "@/app/lib/article/article-types";
import { getParam } from "@/app/lib/article/article-utils";
import { useTagInput } from "@/app/lib/editor/use-tag-input";

type SearchFieldsProps = {
  searchParams: ArticleSearchParams;
  candidates?: TaxonomyCandidates;
};

/**
 * Renders the full set of search fields as a block.
 */
export function SearchFields({ searchParams, candidates }: SearchFieldsProps) {
  const {
    value: tagValue,
    handleChange: handleTagsChange,
    suggestions: tagCandidates,
  } = useTagInput(getParam(searchParams.tag), candidates?.tags);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <FormField
        id="keyword"
        defaultValue={getParam(searchParams.keyword)}
        placeholder="Search articles..."
        required={false}
        icon={Search}
      />
      <FormField
        id="category"
        defaultValue={getParam(searchParams.category)}
        placeholder="e.g. Computer Science"
        candidates={candidates?.category}
        required={false}
        icon={Folder}
      />
      <FormField
        id="series"
        defaultValue={getParam(searchParams.series)}
        placeholder="e.g. My Dev"
        candidates={candidates?.series}
        required={false}
        icon={BookOpen}
      />
      <FormField
        id="tag"
        value={tagValue}
        onChange={handleTagsChange}
        candidates={tagCandidates}
        placeholder="tag1, tag2, ..."
        required={false}
        icon={Tag}
      />
    </div>
  );
}
