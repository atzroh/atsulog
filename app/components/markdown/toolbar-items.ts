import {
  Bold,
  CheckSquare,
  Code,
  FileCode,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  type LucideIcon,
  Minus,
  Quote,
  Radical,
  Sigma,
  Strikethrough,
  Table,
} from "lucide-react";

/**
 * One toolbar button: the syntax it wraps the selection in, and the text it
 * falls back to when nothing is selected.
 */
type ToolbarItem = {
  icon: LucideIcon;
  prefix: string;
  suffix: string;
  placeholder: string;
  title: string;
};

/**
 * Toolbar buttons, grouped. A divider is drawn between groups, so the grouping
 * is what separates inline emphasis from block syntax from links from math.
 */
export const toolbarGroups: ToolbarItem[][] = [
  [
    {
      icon: Bold,
      prefix: "**",
      suffix: "**",
      placeholder: "bold text",
      title: "Bold",
    },
    {
      icon: Italic,
      prefix: "*",
      suffix: "*",
      placeholder: "italic text",
      title: "Italic",
    },
    {
      icon: Strikethrough,
      prefix: "~~",
      suffix: "~~",
      placeholder: "strikethrough",
      title: "Strikethrough",
    },
    {
      icon: Code,
      prefix: "`",
      suffix: "`",
      placeholder: "code",
      title: "Inline Code",
    },
  ],
  [
    {
      icon: Heading2,
      prefix: "## ",
      suffix: "",
      placeholder: "Heading",
      title: "Heading",
    },
    {
      icon: Quote,
      prefix: "> ",
      suffix: "",
      placeholder: "quote",
      title: "Quote",
    },
    {
      icon: Minus,
      prefix: "\n---\n",
      suffix: "",
      placeholder: "",
      title: "Horizontal Rule",
    },
  ],
  [
    {
      icon: List,
      prefix: "- ",
      suffix: "",
      placeholder: "item",
      title: "Unordered List",
    },
    {
      icon: ListOrdered,
      prefix: "1. ",
      suffix: "",
      placeholder: "item",
      title: "Ordered List",
    },
    {
      icon: CheckSquare,
      prefix: "- [ ] ",
      suffix: "",
      placeholder: "task",
      title: "Task List",
    },
  ],
  [
    {
      icon: LinkIcon,
      prefix: "[",
      suffix: "](url)",
      placeholder: "link text",
      title: "Link",
    },
    {
      icon: FileCode,
      prefix: "```\n",
      suffix: "\n```",
      placeholder: "code",
      title: "Code Block",
    },
    {
      icon: Table,
      prefix: "\n| Header | Header |\n| :--- | :--- |\n| ",
      suffix: " | Cell |\n",
      placeholder: "Cell",
      title: "Table",
    },
  ],
  [
    {
      icon: Sigma,
      prefix: "$",
      suffix: "$",
      placeholder: "x^2",
      title: "Inline Math",
    },
    {
      // The surrounding blank lines are the point of this button: without
      // them the `$$` is swallowed by the neighbouring paragraph and the
      // equation renders inline.
      icon: Radical,
      prefix: "\n$$\n",
      suffix: "\n$$\n",
      placeholder: "x^2",
      title: "Math Block",
    },
  ],
];
