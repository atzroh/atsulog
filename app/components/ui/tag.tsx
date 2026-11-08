import Link from "next/link";
import { Folder, BookOpen, Tag as TagIcon, X } from "lucide-react";

type TagVariant = "tag" | "category" | "series";

type TagProps = {
  label: string;
  href?: string;
  variant?: TagVariant;
  /** Shows an X; the link is expected to drop this tag. */
  removable?: boolean;
  /** Shown after the label, e.g. the number of articles. */
  count?: number;
};

const VARIANTS: Record<TagVariant, string> = {
  tag: "text-sky-600 hover:text-sky-700",
  category: "text-emerald-600 hover:text-emerald-700",
  series: "text-violet-600 hover:text-violet-700",
};

const ICONS = {
  tag: TagIcon,
  category: Folder,
  series: BookOpen,
};

/**
 * A tag for categories, series or search tags, optionally rendered as a link.
 * Drawn as coloured text with an icon, without a frame.
 */
export function Tag({
  label,
  href,
  variant = "tag",
  removable = false,
  count,
}: TagProps) {
  const Icon = ICONS[variant];

  const combinedStyles = `inline-flex items-center gap-1 text-xs font-medium transition-colors ${VARIANTS[variant]} ${href ? "hover:underline underline-offset-2" : ""}`;

  const content = (
    <>
      <Icon className="size-3" aria-hidden="true" />
      <span>{label}</span>
      {count !== undefined && (
        <span className="opacity-60 tabular-nums">{count}</span>
      )}
      {removable && <X className="size-3 opacity-70" aria-hidden="true" />}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={combinedStyles}
        aria-label={removable ? `Remove ${label}` : undefined}
      >
        {content}
      </Link>
    );
  }

  return <span className={combinedStyles}>{content}</span>;
}
