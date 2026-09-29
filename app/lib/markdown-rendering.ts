import type { Element, Root } from "hast";
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

function rehypeArticle() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;

      // Raw HTML shows as text, as in react-markdown.
      if (node.type === "raw") {
        parent.children[index] = { type: "text", value: node.value };
        return;
      }

      if (node.type !== "element") return;

      transformUrls(node);
      alignToStyle(node);
      if (node.tagName === "table") parent.children[index] = wrapTable(node);
    });
  };
}

// Drops `javascript:` and the like, as in react-markdown.
function transformUrls(node: Element) {
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
}

// An `align` attribute loses to `th { text-left }` in globals.css.
function alignToStyle(node: Element) {
  if (
    (node.tagName === "td" || node.tagName === "th") &&
    node.properties.align
  ) {
    node.properties.style = `text-align:${node.properties.align}`;
    delete node.properties.align;
  }
}

// Lets a wide table scroll instead of pushing the page sideways.
function wrapTable(table: Element): Element {
  return {
    type: "element",
    tagName: "div",
    properties: { className: ["table-scroll"] },
    children: [table],
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  // KaTeX first: both claim ```math fences.
  .use(rehypeKatex)
  .use(rehypeHighlight)
  .use(rehypeArticle)
  .use(rehypeStringify);

// Cached per content: the article page renders on every request.
const CACHE_LIMIT = 64;
const cache = new Map<string, string>();

/**
 * Renders Markdown (GFM, `$math$`) to an HTML string.
 */
export function renderMarkdown(content: string): string {
  const cached = cache.get(content);
  if (cached !== undefined) return cached;

  const html = String(processor.processSync(content));
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(content, html);
  return html;
}
