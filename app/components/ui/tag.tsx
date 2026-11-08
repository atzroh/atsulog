import Link from "next/link";
import { Folder, BookOpen, Tag as TagIcon, X } from "lucide-react";

type TagVariant = "tag" | "category" | "series";

type TagProps = {
  label: string;
  href?: string;
  variant?: TagVariant;
  /** Shows an X; the link is expected to drop this tag. */
  removable?: boolean;
};

const VARIANTS: Record<TagVariant, string> = {
  tag: "bg-sky-50 text-sky-600 border-sky-100/50 hover:bg-sky-500 hover:text-white hover:border-sky-500",
  category:
    "bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-500 hover:text-white hover:border-emerald-500",
  series:
    "bg-violet-50 text-violet-600 border-violet-100/50 hover:bg-violet-500 hover:text-white hover:border-violet-500",
};

const ICONS = {
  tag: TagIcon,
  category: Folder,
  series: BookOpen,
};

/**
 * A tag for categories, series or search tags, optionally rendered as a link.
 */
export function Tag({
  label,
  href,
  variant = "tag",
  removable = false,
}: TagProps) {
  const Icon = ICONS[variant];

  const combinedStyles = `inline-flex items-center px-[0.625rem] py-[0.125rem] rounded-full text-xs font-medium border transition-all duration-200 ${VARIANTS[variant]}`;

  const content = (
    <>
      <Icon className="size-3 mr-1" aria-hidden="true" />
      <span>{label}</span>
      {removable && <X className="size-3 ml-1 opacity-70" aria-hidden="true" />}
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
