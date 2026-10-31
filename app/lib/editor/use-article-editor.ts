import { useState, useCallback } from "react";
import type {
  ArticleMetadata,
  TaxonomyCandidates,
} from "@/app/lib/article/article-types";
import { suggestSeriesDefaults } from "@/app/lib/article/article-utils";
import { useNavigationGuard } from "@/app/lib/editor/use-navigation-guard";
import { useTagInput } from "@/app/lib/editor/use-tag-input";

export function useArticleEditor({
  metadata,
  initialContent,
  action,
  articles,
  candidates,
}: {
  metadata: ArticleMetadata;
  initialContent: string;
  action: (formData: FormData) => Promise<void>;
  articles: ArticleMetadata[];
  candidates?: TaxonomyCandidates;
}) {
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [title, setTitle] = useState(metadata.title);
  const [series, setSeries] = useState(metadata.series ?? "");
  const [category, setCategory] = useState(metadata.category);
  const {
    value: tags,
    setValue: setTags,
    handleChange: handleTagsChange,
    suggestions: tagCandidates,
  } = useTagInput(metadata.tags.join(", "), candidates?.tags);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty =
    (currentContent !== initialContent ||
      title !== metadata.title ||
      series !== (metadata.series ?? "") ||
      category !== metadata.category ||
      tags !== metadata.tags.join(", ")) &&
    !isSubmitting;

  useNavigationGuard(isDirty);

  const handleSubmitAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await action(formData);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  const handleSeriesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSeries = e.target.value;
      setSeries(newSeries);

      if (newSeries.trim() === "") return;

      const suggestion = suggestSeriesDefaults(newSeries, articles, {
        title,
        category,
        tags,
      });
      if (suggestion.title !== undefined) setTitle(suggestion.title);
      if (suggestion.category !== undefined) setCategory(suggestion.category);
      if (suggestion.tags !== undefined) setTags(suggestion.tags);
    },
    [
      title,
      articles,
      category,
      tags,
      setTags,
      setSeries,
      setTitle,
      setCategory,
    ],
  );

  return {
    states: {
      currentContent,
      title,
      series,
      category,
      tags,
      tagCandidates,
      isSubmitting,
    },
    setters: {
      setCurrentContent,
      setTitle,
      setCategory,
    },
    handlers: {
      handleSeriesChange,
      handleTagsChange,
      handleSubmitAction,
    },
  };
}
