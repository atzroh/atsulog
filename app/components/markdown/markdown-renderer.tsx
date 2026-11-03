import { TableOfContents } from "@/app/components/article/table-of-contents";
import { MermaidDiagrams } from "@/app/components/markdown/mermaid-diagrams";
import type { LinkCardMap } from "@/app/lib/link-card/link-card-types";
import { renderMarkdown } from "@/app/lib/markdown/markdown-rendering";

// Imported here so only the routes with an article body load it.
// swap: math shows in a fallback font until KaTeX's fonts arrive.
import "katex/dist/katex-swap.min.css";

type MarkdownRendererProps = {
  content: string;
  /** Open Graph data for the link cards; the editor preview has none. */
  cards?: LinkCardMap;
  /** Puts a table of contents above the body; articles only. */
  withToc?: boolean;
};

/**
 * Renders Markdown as one HTML string, styled by .prose-site.
 */
export function MarkdownRenderer({
  content,
  cards,
  withToc = false,
}: MarkdownRendererProps) {
  const { html, toc } = renderMarkdown(content, cards);

  return (
    <>
      {withToc && <TableOfContents items={toc} />}
      <MermaidDiagrams html={html}>
        <div
          className="prose-site"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </MermaidDiagrams>
    </>
  );
}
