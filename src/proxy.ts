import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get("sb-session");
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/admin"];
  const authRoute = "/auth";

  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));
  const isAuthRoute = pathname.startsWith(authRoute);

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL(authRoute, req.url));
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/public).*)"],
};
