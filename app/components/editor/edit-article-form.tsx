"use client";

import {
  Save,
  BookOpen,
  Type,
  Folder,
  Tag,
  FileText,
  Check,
} from "lucide-react";
import type {
  ArticleMetadata,
  TaxonomyCandidates,
} from "@/app/lib/article/article-types";
import { FormField } from "@/app/components/ui/form-field";
import { MarkdownField } from "@/app/components/markdown/markdown-field";
import { Button } from "@/app/components/ui/button";
import { useArticleEditor } from "@/app/lib/editor/use-article-editor";

type EditArticleFormProps = {
  metadata: ArticleMetadata;
  content: string;
  action: (formData: FormData) => Promise<void>;
  articles: ArticleMetadata[];
  candidates?: TaxonomyCandidates;
};

/**
 * Form for editing article details with preview support.
 */
export function EditArticleForm({
  metadata,
  content,
  action,
  articles,
  candidates,
}: EditArticleFormProps) {
  const {
    currentContent,
    title,
    series,
    category,
    tags,
    tagCandidates,
    isSubmitting,
    setCurrentContent,
    setTitle,
    setCategory,
    handleSeriesChange,
    handleTagsChange,
    handleSubmitAction,
  } = useArticleEditor({
    metadata,
    initialContent: content,
    action,
    articles,
    candidates,
  });
  const { published } = metadata;
  const publishLabel = published ? "Save Changes" : "Publish";

  return (
    <form action={handleSubmitAction} className="space-y-[2rem] pb-[5rem]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
        <FormField
          id="series"
          value={series}
          onChange={handleSeriesChange}
          required={false}
          candidates={candidates?.series}
          placeholder="Optional series name"
          icon={BookOpen}
        />
        <FormField
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title"
          icon={Type}
        />
        <FormField
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          candidates={candidates?.categories}
          placeholder="e.g. Technology"
          icon={Folder}
        />
        <FormField
          id="tags"
          name="tags"
          value={tags}
          onChange={handleTagsChange}
          required={false}
          candidates={tagCandidates}
          placeholder="tag1, tag2, ..."
          icon={Tag}
        />
      </div>

      <MarkdownField value={currentContent} onChange={setCurrentContent} />

      <div className="pt-[1.5rem] border-t border-gray-100 flex justify-end space-x-4">
        {!published && (
          <Button
            type="submit"
            name="intent"
            value="draft"
            icon={FileText}
            variant="outline"
            className="px-[2rem] py-[0.75rem]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
        )}
        <Button
          type="submit"
          name="intent"
          value="publish"
          icon={published ? Save : Check}
          variant="primary"
          className="px-[2.5rem] py-[0.75rem]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : publishLabel}
        </Button>
      </div>
    </form>
  );
}
