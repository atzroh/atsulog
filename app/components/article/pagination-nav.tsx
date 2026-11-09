"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";
import { buildArticleSearchUrl } from "@/app/lib/article/article-utils";

type PaginationNavProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: ArticleSearchParams;
};

/**
 * `edge` (first/last, icon-only) and `step` (prev/next, labelled) also differ
 * in resting colour, so the split is not merely cosmetic.
 */
const ENABLED =
  "rounded-lg transition-colors text-muted hover:text-foreground hover:bg-gray-50";

const VARIANTS = {
  edge: {
    base: "p-2",
    enabled: ENABLED,
  },
  step: {
    base: "p-2 px-3 text-sm font-medium flex items-center",
    enabled: `${ENABLED} border border-transparent hover:border-gray-300`,
  },
};

/**
 * A Link, or an inert span when the target page does not exist, so a disabled
 * control keeps its slot and the row never reflows.
 */
function PageLink({
  href,
  disabled,
  title,
  variant,
  children,
}: {
  href: string;
  disabled: boolean;
  title?: string;
  variant: keyof typeof VARIANTS;
  children: React.ReactNode;
}) {
  const { base, enabled } = VARIANTS[variant];

  if (disabled) {
    return (
      <span className={`${base} text-gray-200 cursor-not-allowed`}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} title={title} className={`${base} ${enabled}`}>
      {children}
    </Link>
  );
}

/** The page indicator; clicking it lets you type a page to jump to. */
function PageJumper({
  currentPage,
  totalPages,
  pageHref,
}: {
  currentPage: number;
  totalPages: number;
  pageHref: (page: number) => string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [inputPage, setInputPage] = useState(currentPage.toString());
  const [prevPage, setPrevPage] = useState(currentPage);

  // Sync input when currentPage changes externally
  if (currentPage !== prevPage) {
    setPrevPage(currentPage);
    setInputPage(currentPage.toString());
  }

  const handleJump = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const page = Number.parseInt(inputPage, 10);
    if (page >= 1 && page <= totalPages) {
      router.push(pageHref(page));
    } else {
      setInputPage(currentPage.toString());
    }
    setIsEditing(false);
  };

  return isEditing ? (
    <form
      onSubmit={handleJump}
      className="px-4 py-2 text-sm font-medium text-foreground bg-gray-50 rounded-lg flex items-center"
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputPage}
        onChange={(e) => setInputPage(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="w-6 bg-transparent border-none text-sm font-medium text-foreground text-center focus:ring-0 p-0 outline-none"
      />
      <span className="text-muted font-normal mx-1">/</span>
      <span className="text-sm font-medium text-foreground">{totalPages}</span>
    </form>
  ) : (
    <button
      onClick={() => setIsEditing(true)}
      className="px-4 text-sm font-medium text-foreground bg-gray-50 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      title="Jump to page"
    >
      {currentPage} <span className="text-muted font-normal mx-1">/</span>{" "}
      {totalPages}
    </button>
  );
}

/** Pagination links around a PageJumper. */
export function PaginationNav({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationNavProps) {
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const pageHref = (page: number) =>
    buildArticleSearchUrl(basePath, searchParams, { page });

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center mt-12 py-8"
    >
      <div className="flex items-center space-x-2">
        <PageLink
          href={pageHref(1)}
          disabled={!hasPreviousPage}
          title="First Page"
          variant="edge"
        >
          <span className="sr-only">First</span>
          <ChevronsLeft className="size-4" />
        </PageLink>
        <PageLink
          href={pageHref(currentPage - 1)}
          disabled={!hasPreviousPage}
          variant="step"
        >
          <ChevronLeft className="size-4 sm:mr-1" />
          <span className="hidden sm:inline">Prev</span>
        </PageLink>

        <PageJumper
          currentPage={currentPage}
          totalPages={totalPages}
          pageHref={pageHref}
        />

        <PageLink
          href={pageHref(currentPage + 1)}
          disabled={!hasNextPage}
          variant="step"
        >
          <span className="sm:mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </PageLink>
        <PageLink
          href={pageHref(totalPages)}
          disabled={!hasNextPage}
          title="Last Page"
          variant="edge"
        >
          <span className="sr-only">Last</span>
          <ChevronsRight className="size-4" />
        </PageLink>
      </div>
    </nav>
  );
}
