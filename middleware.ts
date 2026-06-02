import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Hardcoded to avoid importing Lucia (which pulls in DB/sqlite) into Edge middleware.
// Middleware always runs in the Edge runtime; Node-only modules like better-sqlite3/fs are not supported.
// Actual session validation happens in the protected layout (which forces nodejs runtime).
const SESSION_COOKIE_NAME = "auth_session";

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;

  // Protect all app routes that use DB, Stripe, PDF, etc. (layout does final auth check + redirect)
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/pricebook") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/billing");

  if (isProtectedRoute) {
    if (!sessionId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Lightweight cookie presence check only. No DB access here.
  }

  return NextResponse.next();
}

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