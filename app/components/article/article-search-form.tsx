"use client";

import { Search, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import Form from "next/form";
import { SearchFields } from "@/app/components/article/search-fields";
import { Button } from "@/app/components/ui/button";
import type {
  ArticleSearchParams,
  TaxonomyCandidates,
} from "@/app/lib/article/article-types";
import { PageHeading } from "@/app/components/ui/page-heading";

type ArticleSearchFormProps = {
  searchParams: ArticleSearchParams;
  candidates?: TaxonomyCandidates;
  action?: string;
};

/** next/form turns the fields into query params and prefetches the result. */
export function ArticleSearchForm({
  searchParams,
  candidates,
  action = "/articles",
}: ArticleSearchFormProps) {
  const router = useRouter();

  return (
    <section className="mb-[4rem]">
      <PageHeading className="mb-8">Search & Filter</PageHeading>
      <Form action={action}>
        <SearchFields
          key={JSON.stringify(searchParams)}
          searchParams={searchParams}
          candidates={candidates}
        />

        <div className="flex items-center space-x-[1rem]">
          <Button type="submit" icon={Search} variant="primary">
            Search
          </Button>
          <Button
            type="button"
            onClick={() => router.push(action)}
            icon={RotateCcw}
            variant="outline"
          >
            Clear
          </Button>
        </div>
      </Form>
    </section>
  );
}
