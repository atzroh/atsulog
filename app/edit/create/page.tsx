import { redirect } from "next/navigation";
import { EditArticleForm } from "@/app/components/editor/edit-article-form";
import {
  createArticle,
  getArticles,
} from "@/app/lib/article/article-repository";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { requireAuth } from "@/app/lib/auth/auth";
import {
  buildNewArticle,
  getTaxonomies,
  parseArticleForm,
} from "@/app/lib/article/article-utils";

const INITIAL_METADATA: ArticleMetadata = {
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

    const { content, ...form } = parseArticleForm(formData);

    await createArticle(buildNewArticle(form, new Date()), content);
    redirect(`/edit/`);
  }

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Create New Articles
      </h1>
      <EditArticleForm
        metadata={INITIAL_METADATA}
        content=""
        action={handleCreate}
        articles={articles}
        candidates={taxonomies}
      />
    </main>
  );
}
