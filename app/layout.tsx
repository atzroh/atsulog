import { Home, Search, User, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { Murecho } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { GoogleAnalytics } from "@next/third-parties/google";
import { siteConfig } from "@/app/lib/site-config";
import { isAuthenticated } from "@/app/lib/auth/auth";
import { AdminMenu } from "@/app/components/ui/admin-menu";
import { GaOptOut } from "@/app/components/analytics/ga-opt-out";
import { SocialLinks } from "@/app/components/ui/social-links";
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
  const authenticated = await isAuthenticated();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={siteConfig.htmlLang} className={murecho.variable}>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
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
                <span className="group-hover:text-muted lowercase">
                  {siteConfig.title}
                </span>
              </Link>
              {authenticated && (
                <div className="flex items-center border-l border-gray-200 pl-4">
                  <AdminMenu />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <NavLink href="/" icon={Home} label="Home" />
              <NavLink
                href={`/articles/${siteConfig.aboutSlug}`}
                icon={User}
                label="About"
              />
              <NavLink href="/articles" icon={Search} label="Search" />
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          <main>{children}</main>
        </div>
        <footer className="max-w-3xl mx-auto w-full px-6 py-8 border-t border-gray-200 text-sm text-muted text-center">
          <SocialLinks />
          <Link href="/privacy" className="block mb-2 hover:text-foreground">
            Privacy Policy
          </Link>
          &copy; {currentYear} {siteConfig.title}
        </footer>
        {gaId && <GaOptOut gaId={gaId} disabled={authenticated} />}
      </body>
      {gaId && !authenticated && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center"
    >
      <Icon className="size-4.5 md:size-4 md:mr-1.5" />
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}
