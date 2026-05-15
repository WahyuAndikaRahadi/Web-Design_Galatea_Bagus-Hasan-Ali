import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const PROTECTED_PATHS = [
  "/explore",
  "/dashboard",
  "/project",
  "/profile",
  "/settings",
  "/onboarding",
];

const AUTH_PATHS = ["/login", "/register"];

export default auth(async function middleware(req: NextRequest & { auth: unknown }) {
  const { pathname } = req.nextUrl;
  const session = (req as { auth?: { user?: { id?: string; onboardingDone?: boolean } } }).auth;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Redirect to login if not authenticated and trying to access protected route
  if (isProtected && !session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // --- ADMIN ISOLATION ---
  // If user is ADMIN, they should NOT access user-facing features (dashboard, explore, etc.)
  if (
    session?.user &&
    (session.user as any).role === "ADMIN" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    pathname !== "/"
  ) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Redirect to onboarding if not completed (Skip for ADMINs)
  if (
    session?.user &&
    (session.user as any).role !== "ADMIN" &&
    !session.user.onboardingDone &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/api")
  ) {
    if (isProtected && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/explore/:path*",
    "/dashboard/:path*",
    "/project/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};
