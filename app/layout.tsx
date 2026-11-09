import { Home, Search, User, UserCog } from "lucide-react";
import type { Metadata } from "next";
import { Murecho } from "next/font/google";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteConfig } from "@/app/lib/site-config";
import { isAuthenticated } from "@/app/lib/auth/auth";
import { GaOptOut } from "@/app/components/analytics/ga-opt-out";
import { SocialLinks } from "@/app/components/ui/social-links";
import { AuthorLine } from "@/app/components/ui/author-line";
import { NavLink } from "@/app/components/ui/nav-link";
import { getGitHubProfile } from "@/app/lib/github/github-profile";
import "./globals.css";

// Variable font, so every weight from 100 to 900 is available.
const murecho = Murecho({
  subsets: ["latin"],
  variable: "--font-murecho",
  display: "swap",
});

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
  const [authenticated, profile] = await Promise.all([
    isAuthenticated(),
    getGitHubProfile(),
  ]);
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={siteConfig.htmlLang} className={murecho.variable}>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
          {/* The rule spans the text column, not the window. */}
          <div className="max-w-3xl mx-auto px-6">
            {/* A phone shows the links as icons and drops the dots. */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-gray-200 pt-6 pb-4 text-[13px] uppercase tracking-[0.18em]">
              <Link
                href="/"
                className="font-medium text-foreground hover:text-sky-600 transition-colors"
              >
                {siteConfig.title}
              </Link>
              {authenticated && (
                <>
                  <span aria-hidden="true" className="text-gray-300">
                    /
                  </span>
                  <NavLink href="/admin" icon={<UserCog />}>
                    Admin
                  </NavLink>
                </>
              )}
              <nav
                aria-label="Main"
                className="ml-auto flex items-center gap-5 sm:gap-3.5"
              >
                <NavLink href="/" icon={<Home />}>
                  Home
                </NavLink>
                <span
                  aria-hidden="true"
                  className="hidden text-gray-300 sm:inline"
                >
                  ·
                </span>
                <NavLink
                  href={`/articles/${siteConfig.aboutSlug}`}
                  icon={<User />}
                >
                  About
                </NavLink>
                <span
                  aria-hidden="true"
                  className="hidden text-gray-300 sm:inline"
                >
                  ·
                </span>
                <NavLink href="/articles" icon={<Search />}>
                  Search
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          <main>{children}</main>
        </div>
        <footer className="max-w-3xl mx-auto w-full px-6 py-8 border-t border-gray-200 text-sm text-muted text-center flex flex-col items-center gap-4">
          {profile && <AuthorLine profile={profile} />}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <SocialLinks />
            <span aria-hidden="true" className="text-gray-300">
              |
            </span>
            <Link
              href="/privacy"
              className="hover:text-sky-600 hover:underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            <span>
              &copy; {currentYear} {siteConfig.title}
            </span>
          </div>
        </footer>
        {gaId && <GaOptOut gaId={gaId} disabled={authenticated} />}
      </body>
      {gaId && !authenticated && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
