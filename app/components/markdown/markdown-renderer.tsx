import type { Root } from "hast";
import { urlAttributes } from "html-url-attributes";
import { defaultUrlTransform } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

// Scoped here rather than in globals.css on purpose: Next bundles this stylesheet
// only into the routes that render this component (the article page and /edit),
// so the pages that carry no article body never pay for it. The KaTeX_*.woff2
// files it references are emitted to .next/static/media, which standalone.sh
// already copies.
// The swap variant shows math in a fallback font until KaTeX's fonts arrive,
// instead of leaving it blank.
import "katex/dist/katex-swap.min.css";

/**
 * What react-markdown did after the rehype plugins, kept so that rendering to a
 * string changes nothing a reader sees: raw HTML shows as text, and URLs pass
 * through defaultUrlTransform, which drops `javascript:` and the like.
 *
 * remark-gfm emits a bare <table>, which cannot contain itself once its columns
 * outgrow the article column — it pushes the whole page sideways instead. The
 * wrapper gives it a box to scroll inside; `.table-scroll` is styled in
 * globals.css alongside the other scrolling blocks.
 */
function rehypeArticle() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;

      if (node.type === "raw") {
        parent.children[index] = { type: "text", value: node.value };
        return;
      }

      if (node.type !== "element") return;

      for (const key in urlAttributes) {
        const test = urlAttributes[key];
        if (
          Object.hasOwn(node.properties, key) &&
          (test === null || test.includes(node.tagName))
        ) {
          node.properties[key] = defaultUrlTransform(
            String(node.properties[key] || ""),
          );
        }
      }

      // react-markdown moved a GFM column's `align` into `style`; left as an
      // attribute, it loses to the `text-left` globals.css puts on `th`.
      if (
        (node.tagName === "td" || node.tagName === "th") &&
        node.properties.align
      ) {
        node.properties.style = `text-align:${node.properties.align}`;
        delete node.properties.align;
      }

      // visit still descends into the original table, so its links are
      // transformed too and the new wrapper is never revisited.
      if (node.tagName === "table") {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll"] },
          children: [node],
        };
      }
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  // KaTeX must run first: both plugins claim ```math fences, and only
  // this order lets KaTeX replace the <pre> before highlighting rewrites
  // its text into <span>s.
  .use(rehypeKatex)
  .use(rehypeHighlight)
  .use(rehypeArticle)
  .use(rehypeStringify);

// The article page renders on every request, and KaTeX turns each formula into
// dozens of elements, so the finished HTML is kept per content. An edit changes
// the content, so a stale entry is simply never looked up again.
const CACHE_LIMIT = 64;
const cache = new Map<string, string>();

function renderMarkdown(content: string): string {
  const cached = cache.get(content);
  if (cached !== undefined) return cached;

  const html = String(processor.processSync(content));
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(content, html);
  return html;
}

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

/**
 * Renders Markdown with GFM to an HTML string, cached per content.
 * Math is written as `$inline$` and `$$display$$` and typeset with KaTeX.
 * Uses a custom .prose-site class for high-fidelity styling control.
 *
 * The HTML goes in as one string rather than a React tree, so the page neither
 * serialises thousands of KaTeX elements into its payload nor hydrates them.
 */
export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div
      className={`prose-site ${className}`}
      // Only the processor above produces this, and rehypeArticle has already
      // turned any raw HTML into text.
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
