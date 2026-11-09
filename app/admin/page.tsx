import Link from "next/link";
import {
  ArrowRight,
  Images,
  LogOut,
  Pencil,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { PageHeading } from "@/app/components/ui/page-heading";
import { getArticles } from "@/app/lib/article/article-repository";
import { logoutAction } from "@/app/lib/auth/auth-actions";
import { listImages } from "@/app/lib/image/image-store";
import { getImageUsers } from "@/app/lib/image/image-usage";

/** "1 draft", "2 drafts" */
const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

const CARD =
  "group flex w-full items-center gap-4.5 rounded-lg border border-gray-200 p-5 text-left transition-colors hover:border-sky-600 cursor-pointer";

/** A ringed icon, the caps label over its counts, and an arrow on the right. */
function CardContent({
  Icon,
  label,
  meta,
}: {
  Icon: LucideIcon;
  label: string;
  meta?: string;
}) {
  return (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-muted transition-colors group-hover:border-sky-600 group-hover:text-sky-600">
        <Icon className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-[13px] uppercase tracking-[0.18em] transition-colors group-hover:text-sky-600">
          {label}
        </span>
        {meta && (
          <span className="text-[13px] text-muted tabular-nums">{meta}</span>
        )}
      </span>
      <ArrowRight
        className="ml-auto size-4 text-gray-400 transition-colors group-hover:text-sky-600"
        aria-hidden="true"
      />
    </>
  );
}

export default async function AdminPage() {
  // getArticles waits for request time before any database is opened.
  const articles = await getArticles();
  const users = await getImageUsers();
  const images = listImages();

  const drafts = articles.filter((article) => !article.published).length;
  const unused = images.filter((image) => !users.has(image.hash)).length;

  const links = [
    { href: "/admin/create", label: "Create", Icon: Plus },
    {
      href: "/admin/edit",
      label: "Edit",
      Icon: Pencil,
      meta: `${plural(drafts, "draft")} · ${articles.length - drafts} published`,
    },
    {
      href: "/admin/images",
      label: "Images",
      Icon: Images,
      meta: `${plural(images.length, "image")} · ${unused} unused`,
    },
  ];

  return (
    <main>
      <PageHeading className="mb-8">Admin</PageHeading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {links.map(({ href, label, Icon, meta }) => (
          <Link key={href} href={href} className={CARD}>
            <CardContent Icon={Icon} label={label} meta={meta} />
          </Link>
        ))}
        {/* A form, since logging out is a POST. */}
        <form action={logoutAction} className="flex">
          <button type="submit" className={CARD}>
            <CardContent Icon={LogOut} label="Logout" />
          </button>
        </form>
      </div>
    </main>
  );
}
