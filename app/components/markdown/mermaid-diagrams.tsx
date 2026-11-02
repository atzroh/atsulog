"use client";

import { type ReactNode, useEffect, useRef } from "react";

type MermaidDiagramsProps = {
  /** The rendered HTML inside; a new value means the blocks were replaced. */
  html: string;
  children: ReactNode;
};

type Mermaid = (typeof import("mermaid"))["default"];
type MermaidConfig = import("mermaid").MermaidConfig;

let mermaidPromise: Promise<Mermaid> | undefined;
// render() needs an id unique on the page.
let nextId = 0;

// The body font in globals.css, so diagrams read as part of the article.
const FONT =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

// Tailwind gray / sky.
const COLOR = {
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  sky50: "#f0f9ff",
  sky100: "#e0f2fe",
  sky200: "#bae6fd",
  sky300: "#7dd3fc",
  sky400: "#38bdf8",
  sky500: "#0ea5e9",
};

// At its own size, so a wide chart scrolls instead of shrinking.
const DIAGRAM_TYPES = [
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "journey",
  "pie",
  "requirement",
  "mindmap",
  "timeline",
  "gitGraph",
  "c4",
  "sankey",
  "xyChart",
  "block",
  "packet",
  "architecture",
  "quadrantChart",
  "radar",
  "kanban",
];
const NO_SHRINK = Object.fromEntries(
  DIAGRAM_TYPES.map((type) => [type, { useMaxWidth: false }]),
) as MermaidConfig;

const CONFIG: MermaidConfig = {
  ...NO_SHRINK,
  startOnLoad: false,
  securityLevel: "strict",
  theme: "base",
  look: "classic",
  fontFamily: FONT,
  themeVariables: {
    fontFamily: FONT,
    fontSize: "14px",
    dropShadow: "none",
    background: COLOR.white,
    textColor: COLOR.gray700,

    // Nodes, and the defaults the other diagram types derive from.
    primaryColor: COLOR.white,
    primaryBorderColor: COLOR.gray900,
    primaryTextColor: COLOR.gray800,
    secondaryColor: COLOR.gray50,
    secondaryBorderColor: COLOR.gray900,
    secondaryTextColor: COLOR.gray800,
    tertiaryColor: COLOR.gray50,
    tertiaryBorderColor: COLOR.gray300,
    tertiaryTextColor: COLOR.gray800,
    mainBkg: COLOR.white,
    nodeBorder: COLOR.gray900,
    nodeTextColor: COLOR.gray800,

    // Edges and subgraphs.
    lineColor: COLOR.gray700,
    edgeLabelBackground: COLOR.white,
    clusterBkg: COLOR.gray50,
    clusterBorder: COLOR.gray300,
    titleColor: COLOR.gray500,

    // Sequence diagrams.
    actorBkg: COLOR.white,
    actorBorder: COLOR.gray900,
    actorTextColor: COLOR.gray800,
    actorLineColor: COLOR.gray300,
    signalColor: COLOR.gray700,
    signalTextColor: COLOR.gray700,
    noteBkgColor: COLOR.sky50,
    noteBorderColor: COLOR.sky200,
    noteTextColor: COLOR.gray700,
    labelBoxBkgColor: COLOR.white,
    labelBoxBorderColor: COLOR.gray300,
    labelTextColor: COLOR.gray700,
    loopTextColor: COLOR.gray700,
    activationBkgColor: COLOR.gray100,
    activationBorderColor: COLOR.gray300,
    sequenceNumberColor: COLOR.white,

    // State diagrams; the label color is white unless set.
    stateBkg: COLOR.white,
    stateBorder: COLOR.gray900,
    stateLabelColor: COLOR.gray800,
    labelColor: COLOR.gray800,
    transitionColor: COLOR.gray700,
    transitionLabelColor: COLOR.gray600,
    specialStateColor: COLOR.gray700,
    innerEndBackground: COLOR.gray700,
    compositeBackground: COLOR.gray50,
    compositeTitleBackground: COLOR.gray50,

    // Pie and Gantt; on a white base they would otherwise be all white.
    pie1: COLOR.sky500,
    pie2: COLOR.sky400,
    pie3: COLOR.sky300,
    pie4: COLOR.sky200,
    pie5: COLOR.sky100,
    pie6: COLOR.gray200,
    pieOpacity: "1",
    pieStrokeColor: COLOR.white,
    pieStrokeWidth: "1px",
    pieOuterStrokeWidth: "0px",
    pieTitleTextSize: "16px",
    pieTitleTextColor: COLOR.gray800,
    pieSectionTextSize: "13px",
    pieSectionTextColor: COLOR.gray800,
    pieLegendTextSize: "13px",
    pieLegendTextColor: COLOR.gray700,
    taskBkgColor: COLOR.sky100,
    taskBorderColor: COLOR.sky400,
    taskTextColor: COLOR.gray800,
    taskTextDarkColor: COLOR.gray800,
    activeTaskBkgColor: COLOR.sky200,
    activeTaskBorderColor: COLOR.sky500,
    doneTaskBkgColor: COLOR.gray100,
    doneTaskBorderColor: COLOR.gray300,
    gridColor: COLOR.gray200,
    todayLineColor: COLOR.sky500,
    sectionBkgColor: COLOR.gray50,
    sectionBkgColor2: COLOR.gray50,
    altSectionBkgColor: COLOR.white,
  },
  // Lands in each diagram's own <style>, so it applies while mermaid measures
  // the labels as well as on the page.
  themeCSS: `
    foreignObject { overflow: visible; }
    /* mermaid wraps a label only when its measured width equals the wrapping
       width exactly, which fails at any zoom other than 100% and leaves the
       text on one clipped line. Wrapping from the start avoids that check. */
    foreignObject > div {
      display: table !important;
      white-space: break-spaces !important;
    }
    .node rect, .cluster rect, rect.actor, rect.note, .statediagram-state rect {
      rx: 4px;
      ry: 4px;
    }
    .edgeLabel, .edgeLabel p, .edgeLabel span {
      font-size: 12px;
      color: ${COLOR.gray600};
    }
    .cluster-label .nodeLabel, .cluster-label span, .cluster-label p {
      font-size: 13px;
      color: ${COLOR.gray500};
    }
  `,
  flowchart: {
    useMaxWidth: false,
    wrappingWidth: 200,
    subGraphTitleMargin: { top: 4, bottom: 4 },
    curve: "basis",
  },
  sequence: {
    useMaxWidth: false,
    mirrorActors: false,
    actorFontFamily: FONT,
    actorFontSize: 14,
    messageFontFamily: FONT,
    messageFontSize: 14,
    noteFontFamily: FONT,
    noteFontSize: 13,
    width: 140,
    height: 44,
    boxMargin: 10,
    noteMargin: 10,
    messageMargin: 36,
  },
};

// Loaded on first use, so a page without a diagram never fetches it.
function loadMermaid(): Promise<Mermaid> {
  mermaidPromise ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize(CONFIG);
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
