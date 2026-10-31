import { redirect } from "next/navigation";
import { EditArticleForm } from "@/app/components/editor/edit-article-form";
import { createArticle, getArticles } from "@/app/lib/article/article-repository";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { requireAuth } from "@/app/lib/auth/auth";
import {
  getTaxonomies,
  parseArticleForm,
} from "@/app/lib/article/article-utils";
import { formatDateTimeCompact } from "@/app/lib/date-format";

const initialMetadata: ArticleMetadata = {
  slug: "",
  title: "",
  category: "",
  series: null,
  seriesOrder: null,
  tags: [],
  createdAt: "",
  modifiedAt: "",
  published: false,
};

export default async function NewArticlePage() {
  const articles = await getArticles();
  const taxonomies = getTaxonomies(articles);

  async function handleCreate(formData: FormData) {
    "use server";

    await requireAuth();

    const { title, category, series, tags, content, isPublished } =
      parseArticleForm(formData);
    const now = new Date();
    const isoString = now.toISOString();

    const timestamp = formatDateTimeCompact(now);
    const slug = isPublished ? timestamp : `draft-${timestamp}`;

    const newMetadata: ArticleMetadata = {
      slug,
      title,
      category,
      series,
      seriesOrder: null,
      tags,
      createdAt: isoString,
      modifiedAt: isoString,
      published: isPublished,
    };

    await createArticle(newMetadata, content);
    redirect(`/edit/`);
  }

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Create New Articles
      </h1>
      <EditArticleForm
        metadata={initialMetadata}
        content=""
        action={handleCreate}
        articles={articles}
        candidates={taxonomies}
      />
    </main>
  );
}
