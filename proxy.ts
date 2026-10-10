import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/auth/auth";
import { siteConfig } from "@/app/lib/site-config";

/** Protects administrative routes and handles authentication redirects. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith("/edit");
  const isPublicAuthRoute = pathname === "/login";

  const isAuthenticated = !!(await decrypt(
    request.cookies.get(siteConfig.cookie)?.value,
  ));

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/edit", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and the favicon.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
