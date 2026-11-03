import GithubSlugger from "github-slugger";
import type { Element, ElementContent, Root } from "hast";
import { urlAttributes } from "html-url-attributes";
import type { Root as MdastRoot } from "mdast";
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

import type { LinkCardMap } from "@/app/lib/link-card/link-card-types";
import {
  buildLinkCard,
  fingerprintCards,
  linkCardUrlOf,
} from "@/app/lib/link-card/link-card-utils";

// --- Types ---

/** A `##` or `###` heading, for the table of contents. */
export type TocItem = { depth: 2 | 3; text: string; id: string };

export type RenderedMarkdown = { html: string; toc: TocItem[] };

type ProcessorOptions = {
  katex?: KatexOptions;
  /** Off for the feed: a reader has none of the CSS a card needs. */
  linkCards?: boolean;
  /** Off for the feed, where the `#` would show after every heading. */
  headingLinks?: boolean;
};

// --- Constants ---

const HEADING = /^h[1-6]$/;

const CACHE_LIMIT = 64;

// A paragraph that is nothing but a URL is drawn as the page it points at.
// Done on mdast so the paragraph becomes the card itself, and so the test for
// what counts is the one collectLinkCardUrls uses.
function remarkLinkCard() {
  return (tree: MdastRoot, file: VFile) => {
    const cards = (file.data.cards ?? {}) as LinkCardMap;

    for (const child of tree.children) {
      if (child.type !== "paragraph") continue;
      const url = linkCardUrlOf(child);
      if (!url) continue;

      // A fresh element per card: rehypeArticle rewrites properties in place,
      // and to-hast assigns hChildren by reference.
      const card = buildLinkCard(url, cards[url]);
      child.data = {
        ...child.data,
        hName: card.tagName,
        hProperties: card.properties,
        hChildren: card.children,
      };
    }
  };
}

function rehypeArticle({ headingLinks = true }: { headingLinks?: boolean }) {
  return (tree: Root, file: VFile) => {
    const baseUrl =
      typeof file.data.baseUrl === "string" ? file.data.baseUrl : undefined;
    const slugger = new GithubSlugger();
    const toc: TocItem[] = [];
    file.data.toc = toc;

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
      if (HEADING.test(node.tagName)) {
        anchorHeading(node, slugger, toc, headingLinks);
      }
    });
  };
}

/** Gives a heading its id, lists `##` and `###` in `toc`, and adds the `#` link. */
function anchorHeading(
  node: Element,
  slugger: GithubSlugger,
  toc: TocItem[],
  headingLinks: boolean,
) {
  const text = headingText(node.children).trim();
  const id = slugger.slug(text);
  node.properties.id = id;
  if (node.tagName === "h2" || node.tagName === "h3") {
    toc.push({ depth: node.tagName === "h2" ? 2 : 3, text, id });
  }
  if (headingLinks) node.children.push(headingLink(id));
}

// KaTeX's MathML copy is skipped, or the formula would be read twice.
function headingText(children: ElementContent[]): string {
  return children
    .map((child) => {
      if (child.type === "text" || child.type === "raw") return child.value;
      if (child.type !== "element") return "";
      const className = child.properties.className;
      if (Array.isArray(className) && className.includes("katex-mathml")) {
        return "";
      }
      return headingText(child.children);
    })
    .join("");
}

function headingLink(id: string): Element {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href: `#${id}`,
      className: ["heading-link"],
      ariaLabel: "Link to this section",
    },
    children: [{ type: "text", value: "#" }],
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

function createProcessor({
  katex,
  linkCards = true,
  headingLinks = true,
}: ProcessorOptions = {}) {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
  if (linkCards) processor.use(remarkLinkCard);

  return (
    processor
      .use(remarkRehype, { allowDangerousHtml: true })
      // KaTeX first: both claim ```math fences.
      .use(rehypeKatex, katex)
      // Left as source for MermaidDiagrams to draw in the browser.
      .use(rehypeHighlight, { plainText: ["mermaid"] })
      .use(rehypeArticle, { headingLinks })
      .use(rehypeStringify)
  );
}

type Processor = ReturnType<typeof createProcessor>;

const processor = createProcessor();
// Built on first use, so the editor preview never builds it.
let feedProcessor: Processor | undefined;

// Cached per content: the article page renders on every request.
const cache = new Map<string, RenderedMarkdown>();

function render(
  processor: Processor,
  content: string,
  cards?: LinkCardMap,
  baseUrl?: string,
): RenderedMarkdown {
  // Keyed by the cards too: one filled in later must not hit an older entry.
  const key = [baseUrl ?? "", fingerprintCards(cards), content].join("\0");
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const file = processor.processSync({
    value: content,
    data: { baseUrl, cards },
  });
  const rendered = {
    html: String(file),
    toc: (file.data.toc ?? []) as TocItem[],
  };
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, rendered);
  return rendered;
}

/**
 * Renders Markdown (GFM, `$math$`) to HTML, with its `##` and `###` headings.
 * Without `cards`, a link card carries its URL alone.
 */
export function renderMarkdown(
  content: string,
  cards?: LinkCardMap,
): RenderedMarkdown {
  return render(processor, content, cards);
}

/**
 * Renders Markdown for a feed entry. Math is MathML alone, as readers lack
 * KaTeX's CSS, and relative URLs are resolved against baseUrl.
 */
export function renderFeedMarkdown(content: string, baseUrl: string): string {
  feedProcessor ??= createProcessor({
    katex: { output: "mathml" },
    linkCards: false,
    headingLinks: false,
  });
  return render(feedProcessor, content, undefined, baseUrl).html;
}
