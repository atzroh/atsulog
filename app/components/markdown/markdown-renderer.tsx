import { renderMarkdown } from "@/app/lib/markdown/markdown-rendering";

// Imported here so only the routes with an article body load it.
// swap: math shows in a fallback font until KaTeX's fonts arrive.
import "katex/dist/katex-swap.min.css";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

/**
 * Renders Markdown as one HTML string, styled by .prose-site.
 */
export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div
      className={`prose-site ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
