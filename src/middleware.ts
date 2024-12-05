import {
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
  REFRESH_TOKEN_REDIRECT,
} from "@/lib/routes";
import { auth } from "./auth";
import { NextResponse } from "next/server";

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch (error) {
    console.error("Invalid token", error);
    return true;
  }
}

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = "/" + nextUrl.pathname.split("/")[1];

  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!isPublicRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }

  const authentication = req.auth;
  if (authentication) {
    const accessToken = authentication.user.accessToken;
    if (isTokenExpired(accessToken)) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
