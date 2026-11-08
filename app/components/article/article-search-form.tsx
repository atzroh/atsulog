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
    <section className="mb-[4rem] space-y-[1rem]">
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
      className="flex items-center gap-[0.625rem] h-12 pl-[1.125rem] pr-[0.375rem] bg-white border border-gray-200 rounded-full transition-all hover:border-gray-300 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-500/10"
    >
      <Search
        className="size-[1.125rem] shrink-0 text-gray-400"
        aria-hidden="true"
      />
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
          className="flex items-center justify-center size-9 shrink-0 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-sky-500"
        >
          <X className="size-[1.125rem]" aria-hidden="true" />
        </button>
      )}
    </Form>
  );
}
