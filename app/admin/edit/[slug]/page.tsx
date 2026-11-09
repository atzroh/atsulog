import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {
  getArticleBySlug,
  getArticles,
  getTaxonomies,
  updateArticle,
} from "@/app/lib/article/article-repository";
import { requireAuth } from "@/app/lib/auth/auth";
import { EditArticleForm } from "@/app/components/editor/edit-article-form";
import {
  applyArticleEdit,
  parseArticleForm,
} from "@/app/lib/article/article-utils";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageNav, PageNavLink } from "@/app/components/ui/page-nav";

type EditArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { slug } = await params;
  const articles = await getArticles();
  const detail = await getArticleBySlug(slug);

  if (!detail) {
    notFound();
  }

  const taxonomies = await getTaxonomies("all");

  async function handleSave(formData: FormData) {
    "use server";

    await requireAuth();

    const { content, ...form } = parseArticleForm(formData);

    await updateArticle(
      applyArticleEdit(
        detail!.metadata,
        form,
        new Date(),
        content !== detail!.content,
      ),
      content,
    );
    redirect("/admin/edit");
  }

  return (
    <main className="space-y-8">
      <PageHeading className="mb-8">Edit</PageHeading>
      <EditArticleForm
        metadata={detail.metadata}
        content={detail.content}
        action={handleSave}
        articles={articles}
        candidates={taxonomies}
      />
      <PageNav label="Article edit navigation">
        <PageNavLink href="/admin/edit" icon={ArrowLeft}>
          Back to Edit List
        </PageNavLink>
        {/* The public article route 404s on an unpublished article, so this
            link is only ever reachable once the draft has been published. */}
        {detail.metadata.published && (
          <PageNavLink href={`/articles/${slug}`} icon={ExternalLink} iconAfter>
            View this article
          </PageNavLink>
        )}
      </PageNav>
    </main>
  );
}
