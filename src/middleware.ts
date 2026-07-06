import {
  CLOUDBASE_SESSION_COOKIE,
  isCloudBaseConfigured,
} from "@/lib/cloudbase/config";
import { isAccessTokenExpired } from "@/lib/cloudbase/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (!isCloudBaseConfigured()) {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const rawToken = request.cookies.get(CLOUDBASE_SESSION_COOKIE)?.value;
  const tokenExpired = rawToken ? isAccessTokenExpired(rawToken) : false;
  const accessToken = rawToken && !tokenExpired ? rawToken : undefined;
  const { pathname } = request.nextUrl;

  function redirectToLogin(redirectPath: string, reason?: string) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", redirectPath);
    if (reason) {
      url.searchParams.set("reason", reason);
    }
    const response = NextResponse.redirect(url);
    if (rawToken && tokenExpired) {
      response.cookies.delete(CLOUDBASE_SESSION_COOKIE);
    }
    return response;
  }

  if (!accessToken && pathname.startsWith("/dashboard")) {
    return redirectToLogin(
      pathname,
      tokenExpired ? "session_expired" : undefined,
    );
  }

  if (
    accessToken &&
    (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (tokenExpired && rawToken) {
    const response = NextResponse.next();
    response.cookies.delete(CLOUDBASE_SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
