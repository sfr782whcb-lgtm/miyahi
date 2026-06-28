import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessPath,
  getHomeForRole,
  isAuthPage,
  isPublicPath,
} from "@/lib/auth/routes";
import { verifySessionToken } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token && isAuthPage(pathname)) {
      const session = await verifySessionToken(token);
      if (session) {
        return NextResponse.redirect(
          new URL(getHomeForRole(session.role), request.url),
        );
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (!canAccessPath(session.role, pathname)) {
    return NextResponse.redirect(
      new URL(getHomeForRole(session.role), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
