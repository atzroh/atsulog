import Link from "next/link";
import { Folder, BookOpen, Tag as TagIcon } from "lucide-react";

/**
 * Valid variants for the Tag component.
 */
type TagVariant = "tag" | "category" | "series";

/**
 * Props for the Tag component.
 */
type TagProps = {
  label: string;
  href?: string;
  variant?: TagVariant;
};

/**
 * A tag for categories, series or search tags, optionally rendered as a link.
 */
export function Tag({ label, href, variant = "tag" }: TagProps) {
  const variants = {
    tag: "bg-sky-50 text-sky-600 border-sky-100/50 hover:bg-sky-500 hover:text-white hover:border-sky-500",
    category:
      "bg-emerald-50 text-emerald-600 border-emerald-100/50 hover:bg-emerald-500 hover:text-white hover:border-emerald-500",
    series:
      "bg-violet-50 text-violet-600 border-violet-100/50 hover:bg-violet-500 hover:text-white hover:border-violet-500",
  };

  const icons = {
    tag: TagIcon,
    category: Folder,
    series: BookOpen,
  };

  const Icon = icons[variant];

  const combinedStyles = `inline-flex items-center px-[0.625rem] py-[0.125rem] rounded-full text-xs font-medium border transition-all duration-200 ${variants[variant]}`;

  const content = (
    <>
      <Icon className="size-3 mr-1" aria-hidden="true" />
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {content}
      </Link>
    );
  }

  return <span className={combinedStyles}>{content}</span>;
}
