import { useState, useCallback } from "react";
import type {
  ArticleMetadata,
  TaxonomyCandidates,
} from "@/app/lib/article/article-types";
import { useNavigationGuard } from "@/app/lib/editor/use-navigation-guard";
import { useTagInput } from "@/app/lib/editor/use-tag-input";

/**
 * Hook to manage the state and logic for the article editor.
 */
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

  // Check if the form is "dirty" (has unsaved changes)
  const isDirty =
    (currentContent !== initialContent ||
      title !== metadata.title ||
      series !== (metadata.series ?? "") ||
      category !== metadata.category ||
      tags !== metadata.tags.join(", ")) &&
    !isSubmitting;

  // Use the navigation guard hook
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

      const seriesArticles = articles
        .filter((a) => a.series === newSeries)
        .sort((a, b) => (b.seriesOrder ?? 0) - (a.seriesOrder ?? 0));

      const previousArticle = seriesArticles[0];
      const isTitleEmpty = title.trim() === "";
      const isTitleSeriesPattern = /#\d{3}$/.test(title);

      if (isTitleEmpty || isTitleSeriesPattern) {
        const nextOrder = previousArticle
          ? (previousArticle.seriesOrder ?? 0) + 1
          : 0;
        const formattedOrder = String(nextOrder).padStart(3, "0");
        setTitle(`${newSeries}#${formattedOrder}`);
      }

      if (previousArticle) {
        if (category === "" || category === "General") {
          setCategory(previousArticle.category);
        }
        if (tags.trim() === "") {
          setTags(previousArticle.tags.join(", "));
        }
      }
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
