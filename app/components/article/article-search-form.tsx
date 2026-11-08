"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Form from "next/form";
import { ActiveFilters } from "@/app/components/article/active-filters";
import type { ArticleSearchParams } from "@/app/lib/article/article-types";
import {
  buildArticleSearchUrl,
  getParam,
} from "@/app/lib/article/article-utils";

type ArticleSearchFormProps = {
  searchParams: ArticleSearchParams;
  action?: string;
};

/** next/form turns the keyword into a query param and prefetches the result. */
export function ArticleSearchForm({
  searchParams,
  action = "/articles",
}: ArticleSearchFormProps) {
  return (
    <section className="mb-16 space-y-4">
      <KeywordForm
        key={JSON.stringify(searchParams)}
        searchParams={searchParams}
        action={action}
      />
      <ActiveFilters searchParams={searchParams} basePath={action} />
    </section>
  );
}

/** Submitted with Enter; the X clears the keyword but keeps the filters. */
function KeywordForm({
  searchParams,
  action,
}: Required<ArticleSearchFormProps>) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const keyword = getParam(searchParams.keyword);
  const [value, setValue] = useState(keyword);

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
    if (keyword) {
      router.push(
        buildArticleSearchUrl(action, searchParams, {
          keyword: null,
          page: null,
        }),
      );
    }
  };

  return (
    <Form
      action={action}
      className="flex items-center gap-2.5 h-12 pl-4.5 pr-1.5 bg-white border border-gray-200 rounded-full transition-[color,background-color,border-color,box-shadow] hover:border-gray-300 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-500/10"
    >
      <Search className="size-4.5 shrink-0 text-muted" aria-hidden="true" />
      <label htmlFor="keyword" className="sr-only">
        Keyword
      </label>
      <input
        ref={inputRef}
        id="keyword"
        name="keyword"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles"
        autoComplete="off"
        enterKeyHint="search"
        className="flex-1 min-w-0 bg-transparent text-base focus:outline-none placeholder:text-gray-400"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear"
          className="flex items-center justify-center size-9 shrink-0 rounded-full text-muted hover:bg-gray-100 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-sky-500"
        >
          <X className="size-4.5" aria-hidden="true" />
        </button>
      )}
    </Form>
  );
}
