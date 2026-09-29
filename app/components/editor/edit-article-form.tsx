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

// --- Types ---

/**
 * Props for the EditArticleForm component.
 */
type EditArticleFormProps = {
  metadata: ArticleMetadata;
  content: string;
  action: (formData: FormData) => Promise<void>;
  articles: ArticleMetadata[];
  candidates?: TaxonomyCandidates;
};

// --- Main Component ---

/**
 * Form component for editing article details with preview support.
 * @param props - Component props.
 * @returns The form element.
 */
export function EditArticleForm(props: EditArticleFormProps) {
  const { states, setters, handlers } = useArticleEditor({
    metadata: props.metadata,
    initialContent: props.content,
    action: props.action,
    articles: props.articles,
    candidates: props.candidates,
  });

  return (
    <form
      action={handlers.handleSubmitAction}
      className="space-y-[2rem] pb-[5rem]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
        <FormField
          id="series"
          value={states.series}
          onChange={handlers.handleSeriesChange}
          required={false}
          candidates={props.candidates?.series}
          placeholder="Optional series name"
          icon={BookOpen}
        />
        <FormField
          id="title"
          value={states.title}
          onChange={(e) => setters.setTitle(e.target.value)}
          placeholder="Article title"
          icon={Type}
        />
        <FormField
          id="category"
          value={states.category}
          onChange={(e) => setters.setCategory(e.target.value)}
          candidates={props.candidates?.category}
          placeholder="e.g. Technology"
          icon={Folder}
        />
        <FormField
          id="tags"
          name="tags"
          value={states.tags}
          onChange={handlers.handleTagsChange}
          required={false}
          candidates={states.tagCandidates}
          placeholder="tag1, tag2, ..."
          icon={Tag}
        />
      </div>

      <MarkdownField
        value={states.currentContent}
        onChange={setters.setCurrentContent}
      />

      <div className="pt-[1.5rem] border-t border-gray-100 flex justify-end space-x-4">
        {!props.metadata.published && (
          <Button
            type="submit"
            name="intent"
            value="draft"
            icon={FileText}
            variant="outline"
            className="px-[2rem] py-[0.75rem]"
            disabled={states.isSubmitting}
          >
            {states.isSubmitting ? "Saving..." : "Save Draft"}
          </Button>
        )}
        <Button
          type="submit"
          name="intent"
          value="publish"
          icon={props.metadata.published ? Save : Check}
          variant="primary"
          className="px-[2.5rem] py-[0.75rem]"
          disabled={states.isSubmitting}
        >
          {states.isSubmitting
            ? "Saving..."
            : props.metadata.published
              ? "Save Changes"
              : "Publish"}
        </Button>
      </div>
    </form>
  );
}
