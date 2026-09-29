import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {
  getArticleBySlug,
  getArticles,
  saveArticle,
} from "@/app/lib/article/article-repository";
import { EditArticleForm } from "@/app/components/editor/edit-article-form";
import { getTaxonomies } from "@/app/lib/article/article-utils";

type EditArticlePageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Article Edit Page.
 */
export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { slug } = await params;
  const articles = await getArticles();
  const detail = await getArticleBySlug(articles, slug);

  if (!detail) {
    notFound();
  }

  const taxonomies = getTaxonomies(articles);

  /**
   * Server Action to handle the update of an article.
   */
  async function handleSave(formData: FormData) {
    "use server";

    const raw = Object.fromEntries(formData) as Record<string, string>;
    const isPublished = raw.intent === "publish";

    const updatedMetadata = {
      ...detail!.metadata,
      title: raw.title,
      category: raw.category,
      series: raw.series.trim() || null,
      tags: raw.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      modifiedAt: new Date().toISOString(),
      published: detail!.metadata.published || isPublished,
    };

    // Use fresh metadata list for saving
    await saveArticle(await getArticles(), updatedMetadata, raw.content);
    redirect(`/edit/`);
  }

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        Edit Article: {detail.metadata.title}
      </h1>
      <EditArticleForm
        metadata={detail.metadata}
        content={detail.content}
        action={handleSave}
        articles={articles}
        candidates={taxonomies}
      />
      <nav
        aria-label="Article edit navigation"
        className="border-t pt-[2.5rem] flex items-center justify-between"
      >
        <Link
          href="/edit"
          className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center"
        >
          <ArrowLeft className="size-[1rem] mr-[0.5rem]" />
          Back to Edit List
        </Link>
        {/* The public article route 404s on an unpublished article, so this
            link is only ever reachable once the draft has been published. */}
        {detail.metadata.published && (
          <Link
            href={`/articles/${slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center"
          >
            View this article
            <ExternalLink className="size-[1rem] ml-[0.5rem]" />
          </Link>
        )}
      </nav>
    </main>
  );
}
