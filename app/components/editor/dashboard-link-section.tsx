import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { PageHeading } from "@/app/components/ui/page-heading";

/** A dashboard heading over one large link card. */
export function DashboardLinkSection({
  title,
  href,
  icon: Icon,
  label,
}: {
  title: string;
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <section>
      <PageHeading className="mb-8">{title}</PageHeading>
      <Link
        href={href}
        className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all duration-300"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
            <Icon className="size-5" />
          </div>
          <span className="text-lg font-semibold text-gray-900 group-hover:text-black transition-colors">
            {label}
          </span>
        </div>
        <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-300">
          &rarr;
        </span>
      </Link>
    </section>
  );
}
