import { Home, Newspaper, Pencil, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/app/lib/site-config";
import { isAuthenticated } from "@/app/lib/auth/auth";
import { LogoutButton } from "@/app/components/ui/logout-button";
import { SocialLinks } from "@/app/components/ui/social-links";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();
  const authenticated = await isAuthenticated();

  return (
    <html lang={siteConfig.htmlLang}>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-[1.5rem] py-[1rem] flex items-center justify-between">
            {/* Left: Title & Admin Actions */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="group flex items-center text-xl font-bold tracking-tight transition-colors"
              >
                <Image
                  src="/favicon.ico"
                  alt="Site Icon"
                  width={20}
                  height={20}
                  className="mr-1"
                />
                <span className="group-hover:text-gray-600 lowercase">
                  {siteConfig.title}
                </span>
              </Link>
              {authenticated && (
                <div className="flex items-center border-l border-gray-100 pl-4">
                  <LogoutButton />
                </div>
              )}
            </div>

            {/* Right: Navigation */}
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center"
              >
                <Home className="size-4.5 md:size-4 md:mr-1.5" />
                <span className="hidden md:inline">Home</span>
              </Link>
              <Link
                href="/articles"
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center"
              >
                <Newspaper className="size-4.5 md:size-4 md:mr-1.5" />
                <span className="hidden md:inline">Articles</span>
              </Link>
              <Link
                href={`/articles/${siteConfig.aboutSlug}`}
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center"
              >
                <User className="size-4.5 md:size-4 md:mr-1.5" />
                <span className="hidden md:inline">About</span>
              </Link>
              {authenticated && (
                <Link
                  href="/edit"
                  className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center"
                >
                  <Pencil className="size-4.5 md:size-4 md:mr-1.5" />
                  <span className="hidden md:inline">Edit</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          <main>{children}</main>
        </div>
        <footer className="max-w-3xl mx-auto w-full px-6 py-8 border-t border-gray-100 text-sm text-muted text-center lowercase">
          <SocialLinks />
          &copy; {currentYear} {siteConfig.title}
        </footer>
      </body>
    </html>
  );
}
