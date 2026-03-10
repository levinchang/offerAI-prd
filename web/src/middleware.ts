import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PREFIX = "/admin";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith(ADMIN_PREFIX) && path !== `${ADMIN_PREFIX}/login`) {
    const adminCookie = request.cookies.get("admin_session")?.value;
    if (!adminCookie) {
      const login = new URL(`${ADMIN_PREFIX}/login`, request.url);
      login.searchParams.set("from", path);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
