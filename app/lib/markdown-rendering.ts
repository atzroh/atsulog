import type { Element, Root } from "hast";
import { urlAttributes } from "html-url-attributes";
import { defaultUrlTransform } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex, { type Options as KatexOptions } from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";

function rehypeArticle() {
  return (tree: Root, file: VFile) => {
    const baseUrl =
      typeof file.data.baseUrl === "string" ? file.data.baseUrl : undefined;

    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;

      // Raw HTML shows as text, as in react-markdown.
      if (node.type === "raw") {
        parent.children[index] = { type: "text", value: node.value };
        return;
      }

      if (node.type !== "element") return;

      transformUrls(node, baseUrl);
      alignToStyle(node);
      if (node.tagName === "table") parent.children[index] = wrapTable(node);
    });
  };
}

// Drops `javascript:` and the like, as in react-markdown. Given a base, also
// resolves relative URLs, which a feed reader cannot.
function transformUrls(node: Element, baseUrl?: string) {
  for (const key in urlAttributes) {
    const test = urlAttributes[key];
    if (
      Object.hasOwn(node.properties, key) &&
      (test === null || test.includes(node.tagName))
    ) {
      const url = defaultUrlTransform(String(node.properties[key] || ""));
      node.properties[key] = baseUrl ? resolveUrl(url, baseUrl) : url;
    }
  }
}

function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return url;
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
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

function createProcessor(katexOptions?: KatexOptions) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    // KaTeX first: both claim ```math fences.
    .use(rehypeKatex, katexOptions)
    .use(rehypeHighlight)
    .use(rehypeArticle)
    .use(rehypeStringify);
}

type Processor = ReturnType<typeof createProcessor>;

const processor = createProcessor();
// Built on first use, so the editor preview never builds it.
let feedProcessor: Processor | undefined;

// Cached per content: the article page renders on every request.
const CACHE_LIMIT = 64;
const cache = new Map<string, string>();

function render(
  processor: Processor,
  content: string,
  baseUrl?: string,
): string {
  const key = baseUrl ? `${baseUrl}\0${content}` : content;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const html = String(
    processor.processSync({ value: content, data: { baseUrl } }),
  );
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, html);
  return html;
}

/**
 * Renders Markdown (GFM, `$math$`) to an HTML string.
 */
export function renderMarkdown(content: string): string {
  return render(processor, content);
}

/**
 * Renders Markdown for a feed entry. Math is MathML alone, as readers lack
 * KaTeX's CSS, and relative URLs are resolved against baseUrl.
 */
export function renderFeedMarkdown(content: string, baseUrl: string): string {
  feedProcessor ??= createProcessor({ output: "mathml" });
  return render(feedProcessor, content, baseUrl);
}
