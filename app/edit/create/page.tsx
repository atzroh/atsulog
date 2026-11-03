import { redirect } from "next/navigation";
import { EditArticleForm } from "@/app/components/editor/edit-article-form";
import {
  createArticle,
  getArticles,
  getTaxonomies,
} from "@/app/lib/article/article-repository";
import type { ArticleMetadata } from "@/app/lib/article/article-types";
import { requireAuth } from "@/app/lib/auth/auth";
import {
  buildNewArticle,
  parseArticleForm,
} from "@/app/lib/article/article-utils";
import { PageHeading } from "@/app/components/ui/page-heading";

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
  const taxonomies = await getTaxonomies("all");

  async function handleCreate(formData: FormData) {
    "use server";

    await requireAuth();

    const { content, ...form } = parseArticleForm(formData);

    await createArticle(buildNewArticle(form, new Date()), content);
    redirect(`/edit/`);
  }

  return (
    <main className="space-y-8">
      <PageHeading className="mb-8">Create New Articles</PageHeading>
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
