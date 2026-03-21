import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "www.vrabandonada.com.br";
const apexHost = "vrabandonada.com.br";

export function middleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;

  if (hostname === apexHost) {
    const redirectUrl = new URL(request.url);
    redirectUrl.hostname = canonicalHost;
    redirectUrl.pathname = pathname;
    redirectUrl.search = search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
