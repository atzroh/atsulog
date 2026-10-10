import { redirect } from "next/navigation";
import { EditArticleForm } from "@/app/components/editor/edit-article-form";
import { getArticles, saveArticle } from "@/app/lib/article/article-repository";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import {
  generateSlug,
  getTaxonomies,
  parseArticleForm,
} from "@/app/lib/article/article-utils";

const initialMetadata: ArticleMetadata = {
  slug: "",
  title: "",
  category: "",
  series: null,
  seriesOrder: null,
  tags: [],
  filePath: "",
  createdAt: "",
  modifiedAt: "",
  viewCount: 0,
  published: false,
};

export default async function NewArticlePage() {
  const articles = await getArticles();
  const taxonomies = getTaxonomies(articles);

  async function handleCreate(formData: FormData) {
    "use server";

    const { title, category, series, tags, content, isPublished } =
      parseArticleForm(formData);
    const now = new Date();
    const isoString = now.toISOString();

    const timestamp = generateSlug(now);
    const slug = isPublished ? timestamp : `draft-${timestamp}`;

    const newMetadata: ArticleMetadata = {
      slug,
      title,
      category,
      series,
      seriesOrder: null,
      tags,
      filePath: `data/articles/${slug}.md`,
      createdAt: isoString,
      modifiedAt: isoString,
      viewCount: 0,
      published: isPublished,
    };

    await saveArticle(await getArticles(), newMetadata, content);
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
