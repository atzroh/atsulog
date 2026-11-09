import Link from "next/link";
import { Images, LogOut, Pencil, Plus, type LucideIcon } from "lucide-react";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageNav } from "@/app/components/ui/page-nav";
import { logoutAction } from "@/app/lib/auth/auth-actions";

const LINKS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin/create", label: "Create", Icon: Plus },
  { href: "/admin/edit", label: "Edit", Icon: Pencil },
  { href: "/admin/images", label: "Images", Icon: Images },
];

export default function AdminPage() {
  return (
    <main>
      <PageHeading className="mb-8">Admin</PageHeading>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-300 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-muted group-hover:bg-gray-900 group-hover:text-white transition-colors">
              <Icon className="size-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Styled as a PageNavLink, but a form: logging out is a POST. */}
      <PageNav label="Admin navigation">
        <form action={logoutAction} className="ml-auto">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-sky-600 hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            Logout
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </form>
      </PageNav>
    </main>
  );
}
