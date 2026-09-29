import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/auth/auth";
import { siteConfig } from "@/app/lib/site-config";

/**
 * Proxy to protect administrative routes and handle authentication redirects.
 * @param request - The incoming request object.
 * @returns The next response (redirect or continue).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes and public authentication routes
  const isProtectedRoute = pathname.startsWith("/edit");
  const isPublicAuthRoute = pathname === "/login";

  // Retrieve the session cookie
  const cookieName = siteConfig.cookie;
  const session = request.cookies.get(cookieName)?.value;

  // Decrypt and verify the session
  const payload = await decrypt(session);
  const isAuthenticated = !!payload;

  // Redirect to login if a protected route is accessed without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Optionally preserve the intended destination
    // loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to edit if an authenticated user accesses the login page
  if (isPublicAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/edit", request.url));
  }

  return NextResponse.next();
}

/**
 * Configuration for the proxy to specify which paths should trigger it.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
