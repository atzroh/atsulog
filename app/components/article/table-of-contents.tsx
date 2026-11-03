import { ChevronRight } from "lucide-react";
import type { TocItem } from "@/app/lib/markdown/markdown-rendering";

type TocGroup = { heading: TocItem | null; children: TocItem[] };

/** Each `##` with the `###` under it; `###` before any `##` gets no parent. */
function groupItems(items: TocItem[]): TocGroup[] {
  const groups: TocGroup[] = [];
  for (const item of items) {
    if (item.depth === 2) {
      groups.push({ heading: item, children: [] });
    } else if (groups.length === 0) {
      groups.push({ heading: null, children: [item] });
    } else {
      groups[groups.length - 1].children.push(item);
    }
  }
  return groups;
}

/** Links to the `##` and `###` headings; nothing for fewer than two. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) {
    return null;
  }

  return (
    <details open className="group border-l-2 border-gray-200 pl-5 mb-12">
      <summary className="cursor-pointer list-none text-sm font-semibold text-gray-500 uppercase tracking-wider [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          strokeWidth={2.5}
          className="inline-block size-3.5 mr-1 align-[-2px] transition-transform group-open:rotate-90"
        />
        Contents
      </summary>
      <ol className="mt-3 text-sm">
        {groupItems(items).map(({ heading, children }, i) => (
          <li key={heading?.id ?? i} className="mb-2">
            {heading && (
              <a
                href={`#${heading.id}`}
                className="font-medium text-gray-800 hover:text-sky-600"
              >
                {heading.text}
              </a>
            )}
            {children.length > 0 && (
              <ul className="mt-1.5 ml-1 border-l border-gray-200 pl-3 space-y-1 text-[13px]">
                {children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className="text-gray-500 hover:text-sky-600"
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}
