"use client";

import { type ReactNode, useEffect, useRef } from "react";

type MermaidDiagramsProps = {
  /** The rendered HTML inside; a new value means the blocks were replaced. */
  html: string;
  children: ReactNode;
};

type Mermaid = (typeof import("mermaid"))["default"];

let mermaidPromise: Promise<Mermaid> | undefined;
// render() needs an id unique on the page.
let nextId = 0;

// Loaded on first use, so a page without a diagram never fetches it.
function loadMermaid(): Promise<Mermaid> {
  mermaidPromise ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "neutral",
      // At its own size, so a wide chart scrolls instead of shrinking.
      flowchart: { useMaxWidth: false },
    });
    return mermaid;
  });
  return mermaidPromise;
}

/**
 * Draws the ```mermaid blocks in its children as diagrams. A block that does
 * not parse keeps its source, with the error below it.
 */
export function MermaidDiagrams({ html, children }: MermaidDiagramsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const codes = ref.current?.querySelectorAll<HTMLElement>(
      "pre > code.language-mermaid",
    );
    if (!codes?.length) return;

    let cancelled = false;

    (async () => {
      const mermaid = await loadMermaid();

      for (const code of codes) {
        if (cancelled) return;
        const pre = code.parentElement!;
        const source = code.textContent ?? "";

        try {
          // Parsed first: render() on a bad diagram leaves an element in body.
          await mermaid.parse(source);
          const { svg } = await mermaid.render(`mermaid-${nextId++}`, source);
          if (cancelled) return;

          const diagram = document.createElement("div");
          diagram.className = "mermaid-diagram";
          diagram.innerHTML = svg;
          pre.replaceWith(diagram);
        } catch (error) {
          if (cancelled) return;

          const message = document.createElement("p");
          message.className = "mermaid-error";
          message.textContent =
            error instanceof Error ? error.message : String(error);
          pre.after(message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [html]);

  return <div ref={ref}>{children}</div>;
}
